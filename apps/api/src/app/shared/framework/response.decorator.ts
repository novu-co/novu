import { ApiExtraModels, ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { customResponseDecorators } from './swagger/responses.decorator';
import { COMMON_RESPONSES } from './constants/responses.schema';
import { DataWrapperDto } from '../dtos/data-wrapper-dto';

import { ErrorDto, ValidationErrorDto } from '../../../error-dto';

export const { ApiOkResponse }: { ApiOkResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiCreatedResponse }: { ApiCreatedResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiAcceptedResponse }: { ApiAcceptedResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiNoContentResponse }: { ApiNoContentResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const {
  ApiMovedPermanentlyResponse,
}: { ApiMovedPermanentlyResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const { ApiFoundResponse }: { ApiFoundResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiBadRequestResponse }: { ApiBadRequestResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const {
  ApiUnauthorizedResponse,
}: { ApiUnauthorizedResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiTooManyRequestsResponse,
}: { ApiTooManyRequestsResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const { ApiNotFoundResponse }: { ApiNotFoundResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const {
  ApiInternalServerErrorResponse,
}: { ApiInternalServerErrorResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const { ApiBadGatewayResponse }: { ApiBadGatewayResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiConflictResponse }: { ApiConflictResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const { ApiForbiddenResponse }: { ApiForbiddenResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const {
  ApiGatewayTimeoutResponse,
}: { ApiGatewayTimeoutResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const { ApiGoneResponse }: { ApiGoneResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;
export const {
  ApiMethodNotAllowedResponse,
}: { ApiMethodNotAllowedResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiNotAcceptableResponse,
}: { ApiNotAcceptableResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiNotImplementedResponse,
}: { ApiNotImplementedResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiPreconditionFailedResponse,
}: { ApiPreconditionFailedResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiPayloadTooLargeResponse,
}: { ApiPayloadTooLargeResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiRequestTimeoutResponse,
}: { ApiRequestTimeoutResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiServiceUnavailableResponse,
}: { ApiServiceUnavailableResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiUnprocessableEntityResponse,
}: { ApiUnprocessableEntityResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const {
  ApiUnsupportedMediaTypeResponse,
}: { ApiUnsupportedMediaTypeResponse: (options?: ApiResponseOptions) => MethodDecorator } = customResponseDecorators;
export const { ApiDefaultResponse }: { ApiDefaultResponse: (options?: ApiResponseOptions) => MethodDecorator } =
  customResponseDecorators;

function buildEnvelopeProperties<DataDto extends Type<unknown>>(isResponseArray: boolean, dataDto: DataDto) {
  if (isResponseArray) {
    return {
      data: {
        type: 'array',
        items: { $ref: getSchemaPath(dataDto) },
      },
    };
  } else {
    return { data: { $ref: getSchemaPath(dataDto) } };
  }
}

function buildSchema<DataDto extends Type<unknown>>(
  shouldEnvelope: boolean,
  isResponseArray: boolean,
  dataDto: DataDto
) {
  if (shouldEnvelope) {
    return {
      properties: buildEnvelopeProperties(isResponseArray, dataDto),
    };
  }

  return { $ref: getSchemaPath(dataDto) };
}

export const ApiResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  statusCode: number = 200,
  isResponseArray = false,
  shouldEnvelope = true
) => {
  let responseDecoratorFunction;
  let description = 'Ok'; // Default description

  switch (statusCode) {
    case 201:
      responseDecoratorFunction = ApiCreatedResponse;
      description = 'Created';
      break;
    case 200:
      responseDecoratorFunction = ApiOkResponse;
      description = 'OK';
      break;
    case 400:
      responseDecoratorFunction = ApiBadRequestResponse;
      description = 'Bad Request';
      break;
    case 401:
      responseDecoratorFunction = ApiUnauthorizedResponse;
      description = 'Unauthorized';
      break;
    case 403:
      responseDecoratorFunction = ApiForbiddenResponse;
      description = 'Forbidden';
      break;
    case 404:
      responseDecoratorFunction = ApiNotFoundResponse;
      description = 'Not Found';
      break;
    case 409:
      responseDecoratorFunction = ApiConflictResponse;
      description = 'Conflict';
      break;
    case 422:
      responseDecoratorFunction = ApiUnprocessableEntityResponse;
      description = 'Unprocessable Entity';
      break;
    case 500:
      responseDecoratorFunction = ApiInternalServerErrorResponse;
      description = 'Internal Server Error';
      break;
    // Add more cases as needed for other status codes
    default:
      responseDecoratorFunction = ApiOkResponse; // Fallback to a default response
      description = 'OK'; // Default description
      break;
  }

  return applyDecorators(
    ApiExtraModels(DataWrapperDto, dataDto),
    responseDecoratorFunction({
      description,
      schema: buildSchema(shouldEnvelope, isResponseArray, dataDto),
    })
  );
};
export const ApiCommonResponses = () => {
  const decorators: any = [];

  for (const [decoratorName, responseOptions] of Object.entries(COMMON_RESPONSES)) {
    const decorator = customResponseDecorators[decoratorName](responseOptions);
    decorators.push(decorator);
  }

  return applyDecorators(
    ...decorators,
    ApiResponse(ErrorDto, 400, false, false),
    ApiResponse(ErrorDto, 404, false, false),
    ApiResponse(ErrorDto, 409, false, false),
    ApiResponse(ValidationErrorDto, 422, false, false)
  );
};
