import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class AuthCredentialsDto {
    @MaxLength(20)
    @MinLength(4)
    @IsString()
    @IsNotEmpty()
    username: string;

    @MinLength(8)
    @MaxLength(20)
    @IsString()
    @IsNotEmpty()
    @Matches(
        /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password too weak'}
    )
    password: string;
}