import { JwtStrategy } from "./jwt.strategy";
import { Test } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { UnauthorizedException } from "@nestjs/common";

const mockUserRepository = () => ({
    findOne: jest.fn(),
});

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UserRepository, useFactory: mockUserRepository }
            ],
        }).compile();

        jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('validate', () => {
        let user;

        beforeEach(() => {
            user = {
                username: 'test',
            };
        });

        it('validates and returns the user based on JWT payload', async () => {
            userRepository.findOne.mockResolvedValue(user);
            expect(userRepository.findOne).not.toHaveBeenCalled();
            const result = await jwtStrategy.validate(user);
            expect(result).toEqual(user);
        });

        it('invalid user and throws expection', async () => {
            userRepository.findOne.mockResolvedValue(null);
            expect(userRepository.findOne).not.toHaveBeenCalled();
            await expect(jwtStrategy.validate(user)).rejects.toThrow(UnauthorizedException);
        });
    });
});