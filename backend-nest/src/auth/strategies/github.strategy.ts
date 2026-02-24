import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-github2";


@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(private configService: ConfigService) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
            callbackURL: configService.get('GITHUB_CALLBACK_URL')!,
            scope: ['user:email'],
        });
    }


    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: Function,

    ): Promise<any> {
        const { id, username, emails, photos } = profile;

        const user = {
            provider: 'github',
            providerId: id,
            email: emails?.[0]?.value || `${username}@github.com`,
            username: username,
            avatarUrl: photos?.[0]?.value,
        };
        done(null, user);
    }
}



