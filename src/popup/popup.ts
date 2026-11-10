import { StorageManager } from "../app-scripts/storage.scripts";
import { ITSMPainterConsts } from "../app-resource/app-consts";


const storageManager = new StorageManager();

storageManager.checkAndCreateNotExistSettings();

const renderSpaces = async () => {
    const spaces = (await storageManager.getITSMPainterSettings())?.spaces;
    document.getElementById('spacesContainer').innerHTML = spaces?.length > 0 ? (await Promise.all(spaces.map(space => { return `<div class="itsm-painter-space-container"><div class="itsm-painter-space">${space}</div><div class="itsm-painter-remove-space-btn" data-space="${space}" title="Удалить"><img class="itsm-painter-remove-icon" /></div></div>` }))).join('') : '<span class="itsm-painter-empty-spaces-caption">Вы пока не добавили пространства ITSM</span>';

    const removeBtns: NodeListOf<HTMLElement> = document.querySelectorAll('.itsm-painter-remove-space-btn');

    for (let btn of removeBtns) {
        btn.addEventListener('click', () => {
            storageManager.removeSpace(btn.dataset.space).then(async () => {
                renderSpaces();
                checkSpace();

                chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                    const currentTab = tabs[0];
                    const spaceUrl = new URL(currentTab.url);
                    if (spaceUrl.hostname === btn.dataset.space) {
                        chrome.tabs.reload();
                    };
                });
            });
        })
    }
}

const checkSpace = async () => {
    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        const currentTab = tabs[0];

        if (currentTab) {
            const spaceUrl = new URL(currentTab.url);
            const domain = spaceUrl.hostname;

            document.getElementById('itsm-painter-space-handler-btn-container').innerHTML = `
                ${domain.includes(ITSMPainterConsts.workingDomain) ? `
                    ${(await storageManager.getITSMPainterSettings()).spaces.find(el => el === domain) && domain.includes(ITSMPainterConsts.workingDomain) ? `
                    <button id="removeSpaceBtn" class="itsm-painter-btn itsm-painter-delete-btn">Удалить текущее пространсто</button>
                    ` : `
                    <button id="addSpaceBtn" class="itsm-painter-btn">Добавить текущее пространсто</button>
                    `}
                ` : ''}
            `;

            document.getElementById('addSpaceBtn')?.addEventListener('click', async () => { storageManager.addSpace(domain).then(() => { renderSpaces(); checkSpace(); chrome.tabs.reload();}); });
            document.getElementById('removeSpaceBtn')?.addEventListener('click', async () => { storageManager.removeSpace(domain).then(() => { renderSpaces(); checkSpace(); chrome.tabs.reload();}); });
        }
    });
}

const addConstListeners = () => {
    document.getElementById('importConfig').addEventListener('click', async () => {
        try {
            const [fileHandle] = await window.showOpenFilePicker({
                types: [
                    {
                        description: "JSON files",
                        accept: { 'json/*': ['.json'] }
                    }
                ],
                multiple: false
            });

            const file = await fileHandle.getFile();
            const fileContent = await file.text();

            const { teams, spaces } = JSON.parse(fileContent);
            const settings = await storageManager.getITSMPainterSettings();
            let uniqueId = 0;

            for (let space of spaces) {
                if (!settings.spaces.includes(space)) {
                    settings.spaces.push(space);
                }
            }

            for (let team of teams) {
                const { color, name } = team;
                const existingTeam = settings.teams.find(el => el.name === name);

                if (!existingTeam) {
                    settings.teams.push({id: new Date().getTime() + uniqueId++, color: color, name: name, hidden: false})
                }
            }

            storageManager.saveITSMPainterSettings(settings).then(() => {
                renderSpaces();
                chrome.tabs.reload();
            });
        }
        catch (error) {
            if (error.name === "AbortError") {
                return null;
            }
            console.error("Unexpected file data");
        }
    });

    document.getElementById('exportConfig').addEventListener('click', async () => {
        try {
            const fileHandle = await window.showSaveFilePicker({
                suggestedName: "ITSMPainter-config.json",
                types: [
                    {
                        description: 'JSON Files',
                        accept: { 'application/json': ['.json'] }
                    }
                ],
                startIn: "downloads"
            });
            const writableStream = await fileHandle.createWritable();

            await writableStream.write(JSON.stringify(await storageManager.getITSMPainterSettings()));
            await writableStream.close();
        }
        catch (error) {
            if (error.name === "AbortError") {
                return null;
            }
            console.error("Export config error");
        }
    });

    document.getElementById('itsm-painter-info-modal-switch-btn').addEventListener('click', () => {
        document.getElementById('itsm-painter-info-modal-background').style.display = "flex";
    });

    document.getElementById('closeInfoModal').addEventListener('click', () => {
        document.getElementById('itsm-painter-info-modal-background').style.display = "none";
    });
}

addConstListeners();
checkSpace();
renderSpaces();
