import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { User } from "./auth.entity";
import { UserRepository } from "./user.repository";
import * as bcrypt from 'bcrypt';

const mockCredentialsDto = {
    username: 'Test',
    password: 'ASadsf123#',
};

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserRepository,
            ],
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('successfully signup the user', () => {
            save.mockResolvedValue(1);
            expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('throws a conflic exception as username already exists', async () => {
            save.mockRejectedValue({ code: '23505' });
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
        });

        it('throws a internal server error', async () => {
            save.mockRejectedValue({ code: '123' });
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new User();
            user.username = 'Test';
            user.validatePassword = jest.fn();
        });

        it('returns the username as validation is successfull', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toEqual(user.username);
        });

        it('returns null as user cannot be found', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(user.validatePassword).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('returns null as password is invalid', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('calls bcrypt.hash to generate hash', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('test');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await userRepository.hashPassword('testPassword', 'testSalt');
            expect(bcrypt.hash).toHaveBeenCalled();
            expect(result).toEqual('test');
        });
    });
});