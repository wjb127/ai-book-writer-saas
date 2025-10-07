/**
 * 구조화된 로깅 유틸리티
 * - 개발 환경: 상세한 로그
 * - 프로덕션 환경: 중요한 정보만
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`
    }

    return `${prefix} ${message}`
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
        name: error.name
      } : error
    }
    console.error(this.formatMessage('error', message, errorContext))
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  // API 요청 로깅
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info(`API Request: ${method} ${path}`, context)
  }

  // API 응답 로깅
  apiResponse(method: string, path: string, statusCode: number, duration: number) {
    this.info(`API Response: ${method} ${path}`, {
      statusCode,
      duration: `${duration}ms`
    })
  }

  // AI 호출 로깅
  aiRequest(operation: string, context?: LogContext) {
    this.info(`AI Request: ${operation}`, context)
  }

  aiResponse(operation: string, duration: number, tokensUsed?: number) {
    this.info(`AI Response: ${operation}`, {
      duration: `${duration}ms`,
      ...(tokensUsed && { tokensUsed })
    })
  }
}

export const logger = new Logger()
