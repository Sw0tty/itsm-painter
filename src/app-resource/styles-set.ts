import { ITSMPainterSettings } from "./app-types";
import { AppScripts } from "../app-scripts/app.scripts";
import { ITSMPainterConsts } from "./app-consts";


export const getStylesSet = async (ITSMPainterSettings: ITSMPainterSettings) => {
    return `
        #view_list .table.focused .grid-row.item-selected:not(.item-dragged), #view_list .table.blurred .grid-row.item-selected {
            background-color: #e0f0ff;
        }

        ${ITSMPainterSettings.addons.darkMode ?
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
            font-family: var(--font-sans);
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
            ITSMPainterSettings.teams.map(async el => {return `.grid-row:has(span[title="${el.name}"]), .item:has(span#ITSMPainter-team-${el.id}) {
            background: ${`var(${ITSMPainterConsts.itsmPainterItemBackgroundVarName}-${el.id}, ${AppScripts.getTeamColorRenderSchema(el.color)})`};
            ${el?.hidden ? 'display: none;' : ''}
            }` 
            })
        )).join("\n\n")}
    `;
}
