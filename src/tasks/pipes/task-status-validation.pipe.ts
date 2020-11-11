import { BadRequestException, PipeTransform } from "@nestjs/common";
import { TaskStatus } from "../task-status.enum";

export class TaskStatusValidationPipe implements PipeTransform {
    readonly allowedStatuses = [
        TaskStatus.OPEN,
        TaskStatus.DONE,
        TaskStatus.IN_PROGRESS
    ];

    transform(value: string) {
        const valueUpper: string = value.toUpperCase();
        if (!this.isValidate(valueUpper)) {
            throw new BadRequestException(`"${value}" is not valid status `);
        }
        return value;
    }

    private isValidate(status: string): boolean {
        return this.allowedStatuses.includes(status as TaskStatus);
    }
}