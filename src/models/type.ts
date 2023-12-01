import { GhostWebUser } from "./param.js";

declare global {
    interface Window {
        ClickLoadPage: (key: string, from: boolean, ...arg: string[]) => void;
        MasterAddr: string;
        MasterNode: GhostWebUser;
        NodeCount: number;
    }
}

interface IPage {
    Run(str: string): boolean;
    Release(): void;
}

export type FuncMap = { [key: string]: IPage };