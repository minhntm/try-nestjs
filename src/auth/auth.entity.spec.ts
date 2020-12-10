import { User } from "./auth.entity";
import * as bcrypt from 'bcrypt';

describe('User entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        user.password = 'hashedPass';
        user.salt = 'salt';
        bcrypt.hash = jest.fn();
    });

    describe('validatePassword', () => {
        it('returns true as password is valid', async () => {
            bcrypt.hash.mockResolvedValue(user.password);
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('adsf');
            expect(bcrypt.hash).toHaveBeenCalledWith('adsf', user.salt);
            expect(result).toEqual(true);
        });

        it('returns false as password is valid', async () => {
            bcrypt.hash.mockResolvedValue('wrongHash');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('adsf');
            expect(bcrypt.hash).toHaveBeenCalledWith('adsf', user.salt);
            expect(result).toEqual(false);
        });
    });
});