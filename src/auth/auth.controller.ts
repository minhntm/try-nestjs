import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials-dto';
import { JwtResponse } from './interface/jwt-response.interface';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post('signin')
    @UsePipes(ValidationPipe)
    signIn(@Body() authCredentialsDto: AuthCredentialsDto): Promise<JwtResponse> {
        return this.authService.signIn(authCredentialsDto);
    }
}
