import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Don't attempt to send if already sent
    if (response.headersSent) {
      return;
    }

    const status = exception.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR;

    const messageCode = HttpStatus[status] ?? "DEFAULT";

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === "object" && "message" in exceptionResponse
        ? exceptionResponse["message"]
        : exceptionResponse;

    response.status(status).json({
      error: true,
      message: message,
      statusCode: status,
      messageCode: messageCode,
      errorMessage: message,
    });
  }
}
