import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GetTaskFilterDto } from "./dto/get-task-filter.dto";
import { TaskStatus } from "./task-status.enum";
import { TaskRepository } from "./tasks.repository";
import { TasksService } from "./tasks.service";

const mockUser = {
    id: 1,
    username: 'AAA',
};

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn(),
});

describe('TasksService', () => {
    let tasksService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: TaskRepository, useFactory: mockTaskRepository },
            ],
        }).compile();

        tasksService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from the repository', async () => {
            taskRepository.getTasks.mockResolvedValue('result');
            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filters: GetTaskFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'search query',
            };
            const result = await tasksService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(taskRepository.getTasks).toHaveBeenCalledWith(filters, mockUser);
            expect(result).toEqual('result');
        });
    });

    describe('getTaskById', () => {
        it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
            const mockTask = { title: 'Test task', description: 'test desc'};
            const taskId = 1;
            taskRepository.findOne.mockResolvedValue(mockTask);
            const result = await tasksService.getTaskById(taskId, mockUser);
            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({
                where: { id: taskId, userId: mockUser.id }
            });
        });

        it('throws an error as task is not found', () => {
            const mockTask = { title: 'Test task', description: 'test desc'};
            const taskId = 1;
            taskRepository.findOne.mockResolvedValue(null);
            expect(tasksService.getTaskById(taskId, mockTask)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('calls taskRepository.create() and returns the result', async () => {
            taskRepository.createTask.mockResolvedValue('result');
            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const createDto: CreateTaskDto = {
                title: 'title',
                description: 'description'
            }
            const result = await tasksService.createTask(createDto, mockUser);
            expect(taskRepository.createTask).toHaveBeenCalled();
            expect(taskRepository.createTask).toHaveBeenCalledWith(createDto, mockUser);
            expect(result).toEqual('result');
        });
    });

    describe('deleteTask', () => {
        it('calls taskRepository.delete() to delete a task', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 1 });
            expect(taskRepository.delete).not.toHaveBeenCalled();
            await tasksService.deleteTask(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({ id: 1, userId: mockUser.id });
        });

        it('throw error that task not found', async () => {
            taskRepository.delete.mockResolvedValue({ affected: 0 });
            expect(taskRepository.delete).not.toHaveBeenCalled();
            expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow();
        });
    });

    describe('updateTaskStatus', () => {
        it('updates a task status', async () => {
            const save = jest.fn().mockResolvedValue(true);

            tasksService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save,
            });

            expect(tasksService.getTaskById).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
            const result = await tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
        })
    })
})