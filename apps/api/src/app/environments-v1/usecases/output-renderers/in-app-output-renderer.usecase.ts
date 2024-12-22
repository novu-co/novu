// Concrete Renderer for In-App Message Preview
import { InAppRenderOutput, RedirectTargetEnum } from '@novu/shared';
import { Injectable } from '@nestjs/common';
import { Instrument, InstrumentUsecase } from '@novu/application-generic';
import { RenderCommand } from './render-command';
import { isValidUrlForActionButton } from '../../../workflows-v2/util/url-utils';
import {
  InAppActionType,
  InAppControlType,
  inAppControlZodSchema,
  InAppRedirectType,
} from '../../../workflows-v2/shared/schemas/in-app-control.schema';

@Injectable()
export class InAppOutputRendererUsecase {
  @InstrumentUsecase()
  execute(renderCommand: RenderCommand): InAppRenderOutput {
    const inApp: InAppControlType = inAppControlZodSchema.parse(renderCommand.controlValues);
    if (!inApp) {
      throw new Error('Invalid in-app control value data');
    }

    const { primaryAction, secondaryAction, redirect } = inApp;

    return {
      subject: inApp.subject,
      body: inApp.body,
      avatar: inApp.avatar?.trim() || undefined,
      primaryAction: this.buildActionIfAllPartsAvailable(primaryAction),
      secondaryAction: this.buildActionIfAllPartsAvailable(secondaryAction),
      redirect: this.buildRedirect(redirect),
      data: inApp.data as Record<string, unknown>,
    };
  }

  private buildRedirect(redirect?: InAppRedirectType) {
    if (!(redirect && redirect.url && this.isValidTarget(redirect) && isValidUrlForActionButton(redirect.url))) {
      return undefined;
    }

    return {
      url: redirect.url,
      target: redirect.target as RedirectTargetEnum,
    };
  }

  private isValidTarget(redirect: InAppRedirectType) {
    if (!redirect || !redirect.target) {
      return false;
    }

    return Object.values(RedirectTargetEnum).includes(redirect.target as RedirectTargetEnum);
  }

  private buildActionIfAllPartsAvailable(action?: InAppActionType) {
    if (!(action && action.label)) {
      return undefined;
    }

    return {
      label: action.label,
      redirect: this.buildRedirect(action.redirect),
    };
  }
}
