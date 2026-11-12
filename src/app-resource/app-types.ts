export type ITSMPainterSettings = {
    teams: Team[],
    addons: Addons;
    spaces: string[];
}

export type Team = {
    id: number;
    name: string;
    color: string;
    hidden: boolean;
}

export type Addons = {
    keepRemind: boolean;
    darkMode: boolean;
}
