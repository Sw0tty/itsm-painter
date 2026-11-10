import { ITSMPainterSettings } from "../app-resource/app-types"
import { StorageManager } from "./storage.scripts";

const storageManager = new StorageManager();
const ITSMPainterConsts = {
    storageId: 'ITSMPainter',
    stylesSetId: 'ITSMPainterStylesSet',



    itsmButtonsMenuContainer: document.getElementById("nav-primary")?.getElementsByClassName("console_buttons")[0],
    shortFormatTasksContainer: () => { return document.getElementsByClassName('grid-container')[0] },
    fullFormatTasksContainer: () => { return document.getElementById('view_list_container')?.querySelector('div') },
    tasksContainerObserver: undefined,
    updateTasksObserverIntervalId: undefined,
    updateInterval: 60000 * 10
}

// const getITSMPainterSettings = async (): Promise<ITSMPainterSettings> => {
//     const data = await chrome.storage.local.get(ITSMPainterConsts.storageId).then(result => { return result[ITSMPainterConsts.storageId] });
//     if (!data) {
//         const itsmPainterSettingsBase: ITSMPainterSettings = { teams: [], addons: { keepRemind: false, darkMode: false }, spaces: [] };
//         chrome.storage.local.set({ [ITSMPainterConsts.storageId]: itsmPainterSettingsBase }).then(() => {
//             return getITSMPainterSettings();
//         });
//     }
//     return await chrome.storage.local.get(ITSMPainterConsts.storageId).then(result => { return result[ITSMPainterConsts.storageId] as ITSMPainterSettings });
// }

// const getITSMPainterTeams = async () => {
//     return (await storageManager.getITSMPainterSettings())?.teams;
// }

const getRandomHexColor = () => {
    const randomNum = Math.floor(Math.random() * 16777215);
    return '#' + randomNum.toString(16).padStart(6, '0');
};

// const saveITSMPainterSettings = async (settingsObject) => {
//     chrome.storage.local.set({ [ITSMPainterConsts.storageId]: settingsObject });
// }

// const saveTeam = async (teamId, name, color) => {
//     const itsmPainterSettings = await storageManager.getITSMPainterSettings();
//     const existingTeam = itsmPainterSettings.teams.find(el => el.id === teamId);
//     if (existingTeam) {
//         existingTeam.name = name;
//         existingTeam.color = color;
//     } else {
//         itsmPainterSettings.teams.push({ id: teamId, name: name, color: color, hidden: false });
//     }
//     storageManager.saveITSMPainterSettings(itsmPainterSettings);
// }

// const deleteTeam = async (id) => {
//     const itsmPainterSettings = await storageManager.getITSMPainterSettings();
//     itsmPainterSettings.teams = itsmPainterSettings.teams.filter(el => el.id != id);
//     storageManager.saveITSMPainterSettings(itsmPainterSettings);
// }

// const hideTeam = async (teamId) => {
//     const itsmPainterSettings = await storageManager.getITSMPainterSettings();
//     const existingTeam = itsmPainterSettings.teams.find(el => el.id === teamId);
//     existingTeam.hidden = !existingTeam?.hidden;
//     storageManager.saveITSMPainterSettings(itsmPainterSettings);
// }

// const switchRemind = async () => {
//     const itsmPainterSettings = await storageManager.getITSMPainterSettings();
//     itsmPainterSettings.addons.keepRemind = (document.getElementById('itsm-painter-reminder-state') as HTMLInputElement).checked;
//     storageManager.saveITSMPainterSettings(itsmPainterSettings);
// }

// const switchDarkMode = async () => {
//     const itsmPainterSettings = await storageManager.getITSMPainterSettings();
//     itsmPainterSettings.addons.darkMode = (document.getElementById('itsm-painter-dark-mode-state') as HTMLInputElement).checked;
//     storageManager.saveITSMPainterSettings(itsmPainterSettings);
// }

const addTasksContainerObserver = () => {
    const intervalId = window.setInterval(() => {
        checkDatagridElementsTarget();
    }, ITSMPainterConsts.updateInterval);
    const tasksContainer = new MutationObserver(() => {
        checkDatagridElementsTarget();
    });
    tasksContainer.observe(ITSMPainterConsts?.shortFormatTasksContainer() ?? ITSMPainterConsts?.fullFormatTasksContainer(), { childList: true });
    ITSMPainterConsts.tasksContainerObserver = tasksContainer;
    ITSMPainterConsts.updateTasksObserverIntervalId = intervalId;
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
                    <button id="random-${el.id}" class="itsm-painter-btn itsm-painter-full-height-element itsm-painter-icon-container cancel-invert">
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
        document.documentElement.style.setProperty(`--itsm-painter-item-background-${teamId}`, `linear-gradient(63deg, rgba(255, 255, 255, 0) 41%, ${event.target.value} 100%)`);
    });

    document.getElementById(`random-${teamId}`).addEventListener('click', () => {
        const randomHexColor = getRandomHexColor();
        (document.getElementById(`color-${teamId}`) as HTMLInputElement).value = randomHexColor;
        document.documentElement.style.setProperty(`--itsm-painter-item-background-${teamId}`, `linear-gradient(63deg, rgba(255, 255, 255, 0) 41%, ${randomHexColor} 100%)`);
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

const getStylesSet = async () => {
    return `
        #view_list .table.focused .grid-row.item-selected:not(.item-dragged), #view_list .table.blurred .grid-row.item-selected {
            background-color: #e0f0ff;
        }

        ${(await storageManager.getITSMPainterSettings()).addons.darkMode ?
        `
        html, html[data-color-mode=light] {
            --color-surface: #132f4d;
            --color-background: #132f4d;
            --color-text: #e4e4e4;
            --color-on-background: #e4e4e4;
            --color-on-surface: #e4e4e4;
            --color-x-perano-blue-tint: #2e4a89;
            --color-x-perano-blue: #25366d;
            --color-link-regular: #26adfc; /*a links*/
            --color-link-title: #26adfc;
            --color-link-preview: #26adfc;
            --color-surface-neutral: #24427d; /*a:hover*/
            --color-surface-active: #24427d;
            --gradient-x-dark: linear-gradient(var(--color-x-purple), #132f4d);
            --color-text-disabled: #8396b2;
            --gradient-specialist-view: linear-gradient(#001133 70%, #155597 100%);
            --color-surface-tint: #24427d;
            --gradient-x-electric-neon-tint: linear-gradient(#637dba, var(--color-transparent));
            --color-text-green: #6ee822;
            --color-accent: #001133;
            --color-surface-hover: var(--color-surface-primary);
            --color-surface-mailbox-toggles: #648fbd;
            --color-surface-icons: #e9e9e9;
            --color-surface-icons-dark: #1e293b;
            --color-surface-global-search-box: #ffffff;
            --color-surface-table-selected-state: #34638f;
            --color-x-purple-dark: var(--color-surface-icons);
        }

        .btn_segmented .btn.btn_toggle.active {
            background: var(--color-surface-primary);
        }

        .btn_segmented .btn.btn_toggle {
            background: var(--color-surface-mailbox-toggles);
        }

        .email-quoted-reply, .email-signature-reply {
            color: var(--color-text);
        }

        .quiet, #view_list .lane-inset .quiet {
            color: var(--color-text);
        }

        #broadcasts-overlay {
            background-image: none;
        }

        div.modal_menu a:hover:not(.disabled) {
            background: var(--color-surface-neutral);
        }

        .welcome-homepage.with-rings-background img, .itsm-painter-icon-container:not(.cancel-invert) img {
            filter: invert(1);
        }
        
        .ii, .i_icon, #view_list .lane-icons.large-icons .icon-large, #view_list .icon-category,
        #modal-records-console-menu ul li[role=menuitem] a[role=link] .ii {
            color: var(--color-surface-icons);
        }
        
        .icon-search {
            color: var(--color-surface-icons-dark);
        }
        
        div.avatar {
            color: var(--color-surface-icons);
        }

        #globalsearchbox {
            background-color: var(--color-surface-global-search-box);
        }

        #view_list .table.blurred .grid-row.item-selected, #view_list .table.focused .grid-row.item-selected:not(.item-dragged),
        #view_list .list.blurred .item.item-selected, #view_list .item.item-selected:not(.item-dragged) {
            background-color: var(--color-surface-table-selected-state);
        }

        * {
            scrollbar-color: var(--color-text) var(--color-surface);
        }
        `
        : ''}
        
        .cell-target {
            color: var(--color-text-green);
        }

        .notes-list ul.list .note-footer .note-footer-icons {
            overflow: hidden;
        }
        
        .welcome-homepage .welcome-header {
            block-size: auto;
        }

        .grid-row:hover {
            background: #a1d1ff;
        }
        
        .grid-row {
            overflow: hidden;
            position: relative;
            z-index: 0;
        }

        .itsm-painter-vertical-separator {
            border-left: 1px solid #d7d7d7;
            margin: 10px 0;
        }
        
        .itsm-painter-settings-btn {
            width: 100%;
            height: 100%;
            position: absolute;
            cursor: pointer;
        }

        .itsm-painter-btn {
            background: white;
            border: 1px solid var(--color-border-surface);
            padding: 3px 10px;
            cursor: pointer;
            transition: background 0.3s, color 0.3s;
            text-wrap: nowrap;
            user-select: none;
        }

        .itsm-painter-full-height-element {
            height: 100%;
        }

        .itsm-painter-textbox {
            border: 1px solid var(--color-border-surface);
            border-radius: 3px;
            padding: 0 3px;
        }

        .itsm-painter-btn:hover {
            background: var(--color-border-surface);
        }

        .itsm-painter-delete-btn:hover {
            color: #ec2525;
        }

        #itsm-painter-settings-container {
            background: var(--color-surface);
            height: 250px;
            position: fixed;
            box-shadow: 0 5px 20px rgba(0, 0, 0, .2);
            border: 1px solid var(--color-border-surface);
            left: 67px;
            border-radius: 20px;
            z-index: 999;
            font-family: monospace;
            color: var(--color-on-surface);
            font-size: 13px;
            display: none;
            padding: 10px 15px;
            column-gap: 10px;
        }

        .itsm-painter-icon-container {
            cursor: pointer;
        }

        .itsm-painter-icon-container img {
            width: 18px;
            height: 18px;
            user-select: none;
            pointer-events: none;
        }

        .itsm-painter-settings-team-name-container {
            display: flex;
            column-gap: 5px;
            overflow: hidden;
        }
        
        .itsm-painter-teams-colors-settings-container {
            width: 430px;
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .itsm-painter-settings-container-teams-actions {
            display: flex;
            flex-direction: column;
            row-gap: 3px;
        }

        #itsm-painter-teams-container {
            flex: 1 0 0%;
            overflow: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            row-gap: 5px;
            padding: 5px 0px;
        }

        .itsm-painter-color-picker::-webkit-color-swatch-wrapper {
            padding: 0;
        }

        .itsm-painter-color-picker::-webkit-color-swatch {
            border: 0;
        }

        #itsm-painter-settings-btn:has(#itsm-painter-settings-state:checked) ~ #itsm-painter-settings-container {
            display: flex;
        }

        .itsm-painter-team-setting {
            display: flex;
            justify-content: space-between;
            align-items: center;
            column-gap: 3px;
            height: 26px;
        }

        .itsm-painter-team-setting-handlers-container {
            display: flex;
            column-gap: 5px;
            align-items: center;
            height: 100%;
        }

        .itsm-painter-team-setting-color-container, .itsm-painter-color-picker {
            max-width: 20px;
            min-width: 20px;
            max-height: 20px;
            min-height: 20px;
            border: 1px solid var(--color-border-surface);
            border-radius: 5px;
            cursor: pointer;
        }

        input[type=color] {
            border: 1px solid var(--color-border-surface);
        }

        .itsm-painter-team-name {
            text-wrap: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .itsm-painter-hot-status {
            position: absolute;
            width: 180px;
            height: 97px;
            left: -15px;
            top: -50px;
            z-index: -1;
            display: flex;
            align-items: center;
            color: white;
            font-size: 60px;
            font-family: monospace;
            font-weight: bold;
            transform: rotate(330deg);
            text-shadow: 0 0 1px black;
        }

        .itsm-painter-hot-status-days {
            background: linear-gradient(179deg, #ffd653, transparent);
        }

        .itsm-painter-hot-status-hours {
            background: linear-gradient(179deg,  #ff5900, transparent);
        }

        .itsm-painter-hot-status-minutes {
            background: linear-gradient(179deg,  #ff0101, transparent);
        }

        .itsm-painter-hot-status-zero {
            background: linear-gradient(179deg, #000000, transparent);
        }

        .avatar_initials {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .itsm-painter-running-line {
            opacity: 0.7;
        }

        .itsm-painter-checkbox {
            display: flex;
            color: var(--color-on-surface);
            column-gap: 5px;
            text-wrap: nowrap;
            width: max-content;
            user-select: none;
            cursor: pointer;
        }
        
        .grid-row:hover {
            background: rgba(255, 255, 255, 0);
        }

        ${(await Promise.all(
            (await storageManager.getITSMPainterTeams()).map(async el => { return `.grid-row:has(span[title="${el.name}"]), .item:has(span#ITSMPainter-team-${el.id}) {
            background: ${`var(--itsm-painter-item-background-${el.id}, linear-gradient(63deg, rgba(255, 255, 255, 0) 41%, ${el.color} 100%))`};
            ${el?.hidden ? 'display: none;' : ''}
        }` })
        )).join("\n\n")}
    `;
}

const updateStylesSet = async () => {
    document.getElementById(ITSMPainterConsts.stylesSetId).innerHTML = await getStylesSet();
}

const addITSMPainterHandlers = async () => {
    document.getElementById('itsm-painter-add-team-btn').addEventListener('click', () => {
        let range = document.createRange();
        const teamId = new Date().getTime();
        let newTeamComponentNode = range.createContextualFragment(`<div id="team-${teamId}" class="itsm-painter-team-setting">
            <input id="name-${teamId}" class="itsm-painter-textbox itsm-painter-full-height-element" type="text" />
            <div class="itsm-painter-team-setting-handlers-container">
                <input id="color-${teamId}" class="itsm-painter-color-picker" type="color" />
                <button id="random-${teamId}" class="itsm-painter-btn itsm-painter-full-height-element itsm-painter-icon-container cancel-invert">
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
                itsmPainterSettings.teams.push({ id: new Date().getTime() + idDiff++, name: teamName, color: getRandomHexColor(), hidden: false });
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
                window.clearInterval(ITSMPainterConsts.updateTasksObserverIntervalId);
                ITSMPainterConsts.tasksContainerObserver.disconnect();
                ITSMPainterConsts.tasksContainerObserver = undefined;
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
                    <div class="itsm-painter-hot-status itsm-painter-hot-status-minutes"><marquee class="itsm-painter-running-line">${minutes} ${(String(minutes).length === 2 && (String(minutes)[1] >= 5 || String(minutes)[1] === 0 || [11, 12, 13, 14].includes(minutes))) || (minutes > 4 && minutes < 10) ? 'минут' : (String(minutes).includes('1')) ? 'минута' : 'минуты'}</marquee></div>
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
    const itsmPainterStyle = document.createElement("style");
    itsmPainterStyle.id = ITSMPainterConsts.stylesSetId;
    itsmPainterStyle.innerHTML = await getStylesSet();
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

        if (ITSMPainterConsts?.fullFormatTasksContainer) {
            addIdsForFullStyle();
        }

        if ((await storageManager.getITSMPainterSettings()).addons.keepRemind) {
            checkDatagridElementsTarget();
            addTasksContainerObserver();
        }

        window.addEventListener('click', (event) => {
            if (!document.getElementById('itsm-painter-settings-btn').contains(event.target) && !document.getElementById('itsm-painter-settings-container').contains(event.target) && !event.target.classList.contains('itsm-painter-btn')) {
                (document.getElementById('itsm-painter-settings-state') as HTMLInputElement).checked = false;
            }
        });
    }
}

startExtensionJob();
