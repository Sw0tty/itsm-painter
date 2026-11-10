import { ITSMPainterSettings } from "../app-resource/app-types";
import { ITSMPainterConsts } from "../app-resource/app-consts";


export class StorageManager {

    public getStorageTemplate = (): ITSMPainterSettings => {
        return { teams: [], addons: { keepRemind: false, darkMode: false }, spaces: [] };
    }

    public checkAndCreateNotExistSettings = async () => {
        chrome.storage.local.get(ITSMPainterConsts.storageId).then((result) => {
            if (!result[ITSMPainterConsts.storageId]) {
                chrome.storage.local.set({ [ITSMPainterConsts.storageId]: this.getStorageTemplate() });
            }
        });
    }

    public getITSMPainterSettings = async (): Promise<ITSMPainterSettings> => {
        const data: any = await chrome.storage.local.get(ITSMPainterConsts.storageId).then(result => { return result[ITSMPainterConsts.storageId] });
        if (!data) {
            chrome.storage.local.set({ [ITSMPainterConsts.storageId]: this.getStorageTemplate() }).then(() => {
                return this.getITSMPainterSettings();
            });
        }
        return data as ITSMPainterSettings;
    }

    public saveITSMPainterSettings = async (settingsObject: ITSMPainterSettings) => {
        chrome.storage.local.set({ [ITSMPainterConsts.storageId]: settingsObject });
    }

    public getITSMPainterTeams = async () => {
        return (await this.getITSMPainterSettings())?.teams;
    }

    public addSpace = async (spaceName) => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        const existingSpace = itsmPainterSettings.spaces.find(el => el === spaceName);
        if (!existingSpace) {
            itsmPainterSettings.spaces.push(spaceName);
        }
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public removeSpace = async (spaceName: string) => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        itsmPainterSettings.spaces = itsmPainterSettings.spaces.filter(el => el !== spaceName);
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public saveTeam = async (teamId, name, color) => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        const existingTeam = itsmPainterSettings.teams.find(el => el.id === teamId);
        if (existingTeam) {
            existingTeam.name = name;
            existingTeam.color = color;
        } else {
            itsmPainterSettings.teams.push({ id: teamId, name: name, color: color, hidden: false });
        }
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public deleteTeam = async (id) => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        itsmPainterSettings.teams = itsmPainterSettings.teams.filter(el => el.id != id);
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public hideTeam = async (teamId) => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        const existingTeam = itsmPainterSettings.teams.find(el => el.id === teamId);
        existingTeam.hidden = !existingTeam?.hidden;
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public switchRemind = async () => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        itsmPainterSettings.addons.keepRemind = (document.getElementById('itsm-painter-reminder-state') as HTMLInputElement).checked;
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

    public switchDarkMode = async () => {
        const itsmPainterSettings = await this.getITSMPainterSettings();
        itsmPainterSettings.addons.darkMode = (document.getElementById('itsm-painter-dark-mode-state') as HTMLInputElement).checked;
        this.saveITSMPainterSettings(itsmPainterSettings);
    }

}
