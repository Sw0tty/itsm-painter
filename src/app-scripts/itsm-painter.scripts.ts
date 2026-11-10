import { StorageManager } from "./storage.scripts";
import { ITSMPainterConsts } from "../app-resource/app-consts";
import { AppScripts } from "./app.scripts";
import { getStylesSet } from "../app-resource/styles-set";

const storageManager = new StorageManager();

const ITSMPainterObserverState = {
    shortFormatTasksContainer: () => { return document.getElementsByClassName('grid-container')[0] },
    fullFormatTasksContainer: () => { return document.getElementById('view_list_container')?.querySelector('div') },
    tasksContainerObserver: undefined,
    updateTasksObserverIntervalId: undefined,
    updateInterval: 60000 * 10
}

const addTasksContainerObserver = () => {
    const intervalId = window.setInterval(() => {
        checkDatagridElementsTarget();
    }, ITSMPainterObserverState.updateInterval);
    const tasksContainer = new MutationObserver(() => {
        checkDatagridElementsTarget();
    });
    tasksContainer.observe(ITSMPainterObserverState?.shortFormatTasksContainer() ?? ITSMPainterObserverState?.fullFormatTasksContainer(), { childList: true });
    ITSMPainterObserverState.tasksContainerObserver = tasksContainer;
    ITSMPainterObserverState.updateTasksObserverIntervalId = intervalId;
}

const addIdsForFullStyle = async () => {
    const teams = document.getElementsByClassName('team');
    const ITSMPainterTeams = await storageManager.getITSMPainterTeams();
    for (let team of teams) {
        team.id = `ITSMPainter-team-${ITSMPainterTeams.find(el => el.name === team.innerHTML).id}`;
    }
}

const renderTeamsList = async () => {
    document.getElementById('itsm-painter-teams-container').innerHTML = (await storageManager.getITSMPainterTeams())?.map(el => { return getTeamComponent(el.id, el.name, el.color, el?.hidden) }).join('');

    (await storageManager.getITSMPainterTeams())?.forEach(el => {
        document.getElementById(`edit-${el.id}`).addEventListener('click', () => {
            document.getElementById(`team-${el.id}`).innerHTML = `
                <input id="name-${el.id}" class="itsm-painter-textbox itsm-painter-full-height-element" type="text" value="${el.name}" />

                <div class="itsm-painter-team-setting-handlers-container">
                    <input id="color-${el.id}" class="itsm-painter-color-picker" type="color" value="${el.color}" />
                    <button id="random-${el.id}" title="Сгенерировать цвет" class="itsm-painter-btn itsm-painter-full-height-element itsm-painter-icon-container cancel-invert">
                        <img src="${chrome.runtime.getURL('src/icons/Random.svg')}" />
                    </button>
                    <button id="save-${el.id}" class="itsm-painter-btn itsm-painter-full-height-element">Сохранить</button>
                    <button id="cancel-${el.id}" class="itsm-painter-btn itsm-painter-full-height-element">Отменить</button>
                </div>`;

                addSaveCancelListeners(el.id);
        });

        document.getElementById(`color-picker-${el.id}`).addEventListener('click', async () => {
            navigator.clipboard.writeText((await storageManager.getITSMPainterTeams()).find(team => team.id === el.id).color);
        });

        document.getElementById(`delete-${el.id}`).addEventListener('click', () => {
            storageManager.deleteTeam(el.id).then(() => {
                renderTeamsList();
                updateStylesSet();
            });
        });

        document.getElementById(`hide-team-${el.id}`).addEventListener('click', () => {
            storageManager.hideTeam(el.id).then(() => {
                renderTeamsList();
                updateStylesSet();
            });
        });
    });
}

const addSaveCancelListeners = (teamId: number) => {
    document.getElementById(`color-${teamId}`).addEventListener('input', (event) => {
        document.documentElement.style.setProperty(`--itsm-painter-item-background-${teamId}`, AppScripts.getTeamColorRenderSchema((event.target as HTMLInputElement).value));
    });

    document.getElementById(`random-${teamId}`).addEventListener('click', () => {
        const randomHexColor = AppScripts.getRandomHexColor();
        (document.getElementById(`color-${teamId}`) as HTMLInputElement).value = randomHexColor;
        document.documentElement.style.setProperty(`--itsm-painter-item-background-${teamId}`, AppScripts.getTeamColorRenderSchema(randomHexColor));
    });

    document.getElementById(`save-${teamId}`).addEventListener('click', () => {
        const name = (document.getElementById(`name-${teamId}`) as HTMLInputElement)?.value?.trim();
        const color = (document.getElementById(`color-${teamId}`) as HTMLInputElement).value;
        
        if (name?.length > 0) {
            storageManager.saveTeam(teamId, name, color).then(() => {
                renderTeamsList();
                updateStylesSet();
            });
        }
    });

    document.getElementById(`cancel-${teamId}`).addEventListener('click', () => {
        renderTeamsList();
        document.documentElement.style.removeProperty(`--itsm-painter-item-background-${teamId}`);
    });
}

const getTeamComponent = (teamId, name, color, hidden) => {
    return `<div id="team-${teamId}" class="itsm-painter-team-setting">

        <div class="itsm-painter-settings-team-name-container">
            <div id="hide-team-${teamId}" class="itsm-painter-icon-container">
                <img src="${chrome.runtime.getURL(`src/icons/${hidden ? 'Hidden' : 'Show'}.svg`)}" />
            </div>
            <span title="${name}" class="itsm-painter-team-name">${name}</span>
        </div>

        
        <div class="itsm-painter-team-setting-handlers-container">
            <div id="color-picker-${teamId}" title="Скопировать цвет" class="itsm-painter-team-setting-color-container" style="background-color: ${color};"></div>
            <button id="edit-${teamId}" class="itsm-painter-btn itsm-painter-full-height-element">Изменить</button>
            <button id="delete-${teamId}" class="itsm-painter-btn itsm-painter-full-height-element itsm-painter-delete-btn">Удалить</button>
        </div>
    </div>`;
}

const updateStylesSet = async () => {
    document.getElementById(ITSMPainterConsts.stylesSetId).innerHTML = await getStylesSet(await storageManager.getITSMPainterSettings());
}

const addITSMPainterHandlers = async () => {
    document.getElementById('itsm-painter-add-team-btn').addEventListener('click', () => {
        let range = document.createRange();
        const teamId = new Date().getTime();
        let newTeamComponentNode = range.createContextualFragment(`<div id="team-${teamId}" class="itsm-painter-team-setting">
            <input id="name-${teamId}" class="itsm-painter-textbox itsm-painter-full-height-element" type="text" />
            <div class="itsm-painter-team-setting-handlers-container">
                <input id="color-${teamId}" class="itsm-painter-color-picker" type="color" />
                <button id="random-${teamId}" title="Сгенерировать цвет" class="itsm-painter-btn itsm-painter-full-height-element itsm-painter-icon-container cancel-invert">
                    <img src="${chrome.runtime.getURL('src/icons/Random.svg')}" />
                </button>
                <button id="save-${teamId}" class="itsm-painter-btn itsm-painter-full-height-element">Сохранить</button>
                <button id="cancel-${teamId}" class="itsm-painter-btn itsm-painter-full-height-element">Отменить</button>
            </div>
        </div>`);
        document.getElementById('itsm-painter-teams-container').insertBefore(newTeamComponentNode, null);
        
        addSaveCancelListeners(teamId);
    });

    document.getElementById('itsm-painter-auto-add-team-btn').addEventListener('click', async () => {
        const uniqueTeamsFromITSM = new Set([...document.querySelectorAll('.grid-row > .cell-team > span')].map(el => el.textContent));
        const itsmPainterSettings = await storageManager.getITSMPainterSettings();
        const existingTeams = new Set(itsmPainterSettings.teams.map(el => el.name));
        const teamsDiff = uniqueTeamsFromITSM.difference(existingTeams);
        
        if (teamsDiff.size > 0) {
            let idDiff = 0;
            for (let teamName of uniqueTeamsFromITSM.difference(existingTeams)) {
                itsmPainterSettings.teams.push({ id: new Date().getTime() + idDiff++, name: teamName, color: AppScripts.getRandomHexColor(), hidden: false });
            }
            storageManager.saveITSMPainterSettings(itsmPainterSettings).then(() => {
                renderTeamsList();
                updateStylesSet();
            });
        }
    });

    document.getElementById('itsm-painter-reminder-state').addEventListener('click', async () => {
        storageManager.switchRemind().then(async () => {
            if ((await storageManager.getITSMPainterSettings()).addons.keepRemind) {
                checkDatagridElementsTarget();
                addTasksContainerObserver();
            } else {
                window.clearInterval(ITSMPainterObserverState.updateTasksObserverIntervalId);
                ITSMPainterObserverState.tasksContainerObserver.disconnect();
                ITSMPainterObserverState.tasksContainerObserver = undefined;
                removeHotStatuses();
            }
        });
    });

    document.getElementById('itsm-painter-dark-mode-state').addEventListener('click', () => {
        storageManager.switchDarkMode().then(() => updateStylesSet());
    });
};

const checkDatagridElementsTarget = () => {
    for (let target of document.querySelectorAll('.cell-target')) {
        const splittedTarget = target.querySelector('span').title.split(' ');

        if (splittedTarget.length === 4) {
            const existingStatus = target.parentNode.querySelector('.itsm-painter-hot-status');
            const splittedTargetDate = splittedTarget[1].split('.');
            const targetTime = splittedTarget[2];
            const days = Math.floor((new Date(`${splittedTargetDate[2]}.${splittedTargetDate[1]}.${splittedTargetDate[0]} ${targetTime}`).getTime() - new Date().getTime())/(1000 * 60 * 60 * 24));
            const hours = Math.floor((new Date(`${splittedTargetDate[2]}.${splittedTargetDate[1]}.${splittedTargetDate[0]} ${targetTime}`).getTime() - new Date().getTime())/(1000 * 60 * 60));
            const minutes = Math.floor((new Date(`${splittedTargetDate[2]}.${splittedTargetDate[1]}.${splittedTargetDate[0]} ${targetTime}`).getTime() - new Date().getTime())/(1000 * 60));

            if (existingStatus) {
                existingStatus.remove();
            }
            if (days < 4 && days > 0) {
                target.insertAdjacentHTML('beforebegin', `
                    <div class="itsm-painter-hot-status itsm-painter-hot-status-days"><marquee class="itsm-painter-running-line">${days} ${days === 1 ? 'день' : 'дня'}</marquee></div>
                    `);
            } else if (days < 1 && hours > 1) {
                target.insertAdjacentHTML('beforebegin', `
                    <div class="itsm-painter-hot-status itsm-painter-hot-status-hours"><marquee class="itsm-painter-running-line">${hours} ${[1, 21].includes(hours) ? 'час' : [2, 3, 4, 23, 22].includes(hours) ? 'часа' : 'часов'}</marquee></div>
                    `);
            } else if (hours < 1 && minutes > 0) {
                target.insertAdjacentHTML('beforebegin', `
                    <div class="itsm-painter-hot-status itsm-painter-hot-status-minutes"><marquee class="itsm-painter-running-line">${minutes} ${(String(minutes).length === 2 && (Number(String(minutes)[1]) >= 5 || Number(String(minutes)[1]) === 0 || [11, 12, 13, 14].includes(minutes))) || (minutes > 4 && minutes < 10) ? 'минут' : (String(minutes).includes('1')) ? 'минута' : 'минуты'}</marquee></div>
                    `);
            } else if ((new Date(`${splittedTargetDate[2]}.${splittedTargetDate[1]}.${splittedTargetDate[0]} ${targetTime}`).getTime() - new Date().getTime()) < 0) {
                target.insertAdjacentHTML('beforebegin', `
                    <div class="itsm-painter-hot-status itsm-painter-hot-status-zero"><marquee class="itsm-painter-running-line">Просрочено</marquee></div>
                    `);
            }
        }
    }
}

const removeHotStatuses = () => {
    for (let target of document.querySelectorAll('.itsm-painter-hot-status')) {
        target.remove();
    }
}

const addITSMPainterStylesSet = async () => {
    const itsmPainterStyle = document.createElement('style');
    itsmPainterStyle.id = ITSMPainterConsts.stylesSetId;
    itsmPainterStyle.innerHTML = await getStylesSet(await storageManager.getITSMPainterSettings());
    document.head.appendChild(itsmPainterStyle);
}

const ITSMPainterBtnHandler = async () => {
    let range = document.createRange();
    let itsmPainterPanelBtn = range.createContextualFragment(`
        <li>
            <a title="Настройки ITMSPainter" id="itsm-painter-settings-btn" class="ii icon-color-palette">
                <label for="itsm-painter-settings-state" class="itsm-painter-settings-btn"></label>
                <input id="itsm-painter-settings-state" type="checkbox" style="display: none;" />
            </a>
            <div id="itsm-painter-settings-container">
                <div class="itsm-painter-teams-colors-settings-container">
                    <div id="itsm-painter-teams-container"></div>
                    <div class="itsm-painter-settings-container-teams-actions">
                        <button id="itsm-painter-add-team-btn" class="itsm-painter-btn">Добавить команду</button>
                        <button id="itsm-painter-auto-add-team-btn" class="itsm-painter-btn">Автоматическое определение</button>
                    </div>
                </div>
                <div class="itsm-painter-vertical-separator"></div>
                <div class="itsm-painter-addons-container">
                    <label for="itsm-painter-reminder-state" class="itsm-painter-checkbox">
                        <input id="itsm-painter-reminder-state" type="checkbox" ${(await storageManager.getITSMPainterSettings()).addons.keepRemind ? 'checked' : ''} />
                        <span>Включить напоминание</span>
                    </label>
                    <label for="itsm-painter-dark-mode-state" class="itsm-painter-checkbox">
                        <input id="itsm-painter-dark-mode-state" type="checkbox" ${(await storageManager.getITSMPainterSettings()).addons.darkMode ? 'checked' : ''} />
                        <span>Темная тема</span>
                    </label>
                </div>
            </div>
        </li>
        `);

    ITSMPainterConsts.itsmButtonsMenuContainer.insertBefore(itsmPainterPanelBtn, null);
}

const checkDomainInSpaces = async () => {
    const spaceUrl = new URL(window.location.href);
    const domain = spaceUrl.hostname;

    if ((await storageManager.getITSMPainterSettings()).spaces.includes(domain)) {
        return true;
    }
    return false;
}

const startExtensionJob = async () => {
    if (await checkDomainInSpaces()) {
        addITSMPainterStylesSet();

        ITSMPainterBtnHandler().then(() => {
            renderTeamsList();
            addITSMPainterHandlers();
        });

        if (ITSMPainterObserverState?.fullFormatTasksContainer) {
            addIdsForFullStyle();
        }

        if ((await storageManager.getITSMPainterSettings()).addons.keepRemind) {
            checkDatagridElementsTarget();
            addTasksContainerObserver();
        }

        window.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (!document.getElementById('itsm-painter-settings-btn').contains(target) && !document.getElementById('itsm-painter-settings-container').contains(target) && !target.classList.contains('itsm-painter-btn')) {
                (document.getElementById('itsm-painter-settings-state') as HTMLInputElement).checked = false;
            }
        });
    }
}

startExtensionJob();
