import { RequestParams } from "@jetbrains/ring-ui-built/components/http/http";
import { ReactNode } from "react";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { AlertItem } from "@jetbrains/ring-ui-built/components/alert-service/alert-service";

export interface Host {
    alert: (message: ReactNode, type?: AlertType, timeout?: number, options?: Partial<AlertItem>) => void;
    fetchYouTrack: (relativeURL: string, requestParams?: RequestParams) => Promise<any>;
    fetchApp: (relativeURL: string, requestParams?: RequestParams & { scope: boolean }) => Promise<any>;
}

export interface Agile {
    id: string;
    name: string;
}

export interface SavedQuery {
    id: string,
    name: string,
    query: string
}

export interface DefaultAgile extends Agile {
    projects: Pick<Project, "id">[],
    sprintsSettings: {
        cardOnSeveralSprints: boolean
    }
    backlog: SavedQuery
}

export interface Sprint {
    id: string,
    name: string,
    agile?: Agile
    issues: Issue[],
}

export interface Project {
    id: string,
    name: string
}

export interface Issue {
    id: string,
    idReadable: string,
    summary: string,
    project: Project,
    isDraft?: boolean
}