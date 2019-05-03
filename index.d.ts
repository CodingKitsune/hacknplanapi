
declare interface HackNPlanAppProps {
  username: string,
  password: string,
  projectId: number
}

declare interface UserData {

}

declare interface Category {
  ProjectId: number,
  CategoryId: number,
  Name: string,
  Icon: string,
  Color: string,
  DisplayOrder: number,
  CreationDate: string
}

declare interface Stage {
  ProjectId: number;
  StageId: number;
  Name: string;
  Icon: string;
  Color: string;
  Status: number;
  IsUnblocker: boolean;
  DisplayOrder: number;
}

declare interface CreatorUser {
  Id: number;
  Username: string;
  Name: string;
  AvatarUrl: string;
  ProductId: number;
}

declare interface BoardCreator {
  Id: number;
  AvatarUrl: string;
  ProductId: number;
}

declare interface BoardProject {
  Id: number;
  Description: string;
  IsDemo: boolean;
}

declare interface Board {
  Id: number;
  Name: string;
  Description: string;
  DueDate: string;
  CreationDate: string;
  Creator: BoardCreator;
  Project: BoardProject;
}

declare interface AssignedUser {
  UserId: number;
  Username: string;
  Name: string;
  AvatarUrl: string;
  IsAdmin: boolean;
  IsActive: boolean;
}

declare interface TaskImportanceLevel {
  ProjectId: number;
  Id: number;
  Name: string;
  IsDefault: boolean;
  DisplayOrder: number;
  CreationDate: string;
}

declare interface Tag {
  ProjectId: number;
  TagId: number;
  DisplayOrder: number;
  Name: string;
  DisplayIconOnly: boolean;
  CreationDate: string;
}

declare interface TaskData {
  ProjectId: number;
  TaskId: number;
  IsStory: boolean;
  Name: string;
  Category: Category;
  Stage: Stage;
  PlannedCost: number;
  TotalCost: number;
  GlobalDisplayOrder: number;
  DesignDisplayOrder: number;
  UpdateDate: string;
  ClosingDate: string;
  CreationDate: string;
  Creator: CreatorUser;
  Board: Board;
  AssignedUsers: AssignedUser[];
  CompletedSubTasks: number;
  TotalSubTasks: number;
  ClosedChildTasks: number;
  TotalChildTasks: number;
  ChildrenPlannedCost: number;
  ChildrenTotalCost: number;
  ImportanceLevel: TaskImportanceLevel;
  HasDependencies: boolean;
  IsBlocked: boolean;
  Tags: Tag[];
}

declare class HackNPlanApp {
  constructor(props: HackNPlanAppProps);
  getUserData(forceRefresh: boolean, timeout?: number): Promise<UserData>;
  logIn(timeout: number): Promise<string>;
  getTaskData(taskNumber: number, timeout?: number): Promise<TaskData>;
  moveTaskToStage(taskNumber: number, stage: number, timeout?: number): Promise<void>;
  commentOnTask(taskNumber: number, comment: string, timeout?: number): Promise<void>;
}

declare const STAGE_PLANNED: number;
declare const STAGE_IN_PROGRESS: number;
declare const STAGE_TESTING: number;
declare const STAGE_COMPLETED: number;

export {
  HackNPlanApp,
  STAGE_PLANNED,
  STAGE_IN_PROGRESS,
  STAGE_TESTING,
  STAGE_COMPLETED
};
