import { BlockStore } from "../store";
import { Session } from "../models/session";

export class GScript {
    m_session: Session
    m_blockStore:BlockStore;
    public constructor(private blockStore: BlockStore, sessions: Session) {
        this.m_session = sessions;
        this.m_blockStore = blockStore;
    }

    public Run(masterAddr: string): boolean {
        Function(`
            editAreaLoader.init({
                id: "gscript_editor", 
                start_highlight: true,
                allow_toggle: false,
                word_wrap: true,
                language: "en",
                syntax: "gscript",
                toolbar: "search, go_to_line, |, undo, redo, |, select_font, |, syntax_selection, |, change_smooth_selection, highlight, reset_highlight, |, help",
                show_line_color: true,
                allow_resize: "y",
            })
            `)()
        
        return true;
    }

    public Release(): void { }
}