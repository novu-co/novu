// Concrete Renderer for In-App Message Preview
import { InAppRenderOutput, RedirectTargetEnum } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { RenderCommand } from './render-command';
import {
  InAppActionType,
  InAppControlType,
  InAppControlZodSchema,
  InAppRedirectType,
} from '../../../workflows-v2/shared';

@Injectable()
export class InAppOutputRendererUsecase {
  execute(renderCommand: RenderCommand): InAppRenderOutput {
    const inApp: InAppControlType = InAppControlZodSchema.parse(renderCommand.controlValues);
    if (!inApp) {
      throw new Error('Invalid in-app control value data');
    }

    const { primaryAction, secondaryAction, redirect } = inApp;

    return {
      subject: inApp.subject,
      body: inApp.body,
      avatar: inApp.avatar,
      primaryAction: this.buildActionIfAllPartsAvailable(primaryAction),
      secondaryAction: this.buildActionIfAllPartsAvailable(secondaryAction),
      redirect: this.buildRedirect(redirect),
      data: inApp.data as Record<string, unknown>,
    };
  }

  private buildRedirect(redirect?: InAppRedirectType) {
    if (!(redirect && redirect.url && isValidURL(redirect.url))) {
      return undefined;
    }

    return {
      url: redirect.url,
      target: redirect.target as RedirectTargetEnum,
    };
  }

  private buildActionIfAllPartsAvailable(action?: InAppActionType) {
    if (!(action && action.label && action.redirect && action.redirect.url && isValidURL(action.redirect.url))) {
      return undefined;
    }

    return {
      label: action.label,
      redirect: {
        url: action.redirect.url.toLowerCase().trim(),
        target: action.redirect.target as RedirectTargetEnum,
      },
    };
  }
}
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);

    return url.protocol === 'http:' || url.protocol === 'https:'; // Ensure it's HTTP or HTTPS
  } catch (error) {
    return false; // The URL is invalid
  }
}
