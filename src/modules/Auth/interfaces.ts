/**
 * Define a token type enum
 */
export enum TokenType {
  GENERAL = 'GENERAL',
  RESET = 'RESET',
  VERIFICATION = 'VERIFICATION',
  REFRESH = 'REFRESH',
  EMAIL_UPDATE_VERIFICATION = 'EMAIL_UPDATE_VERIFICATION',
}


/**
 * Define refresh token types
 */
export enum RefreshTokenType {
  GENERAL = 'GENERAL',
  OTHER = 'OTHER', // For testing
}


/**
 * Define the required data for each TokenType using a generic
 * `extends TokenType` requires the generic (T) to be of type TokenType
 * If we do not define any data, it will fallback to null
 */
export type TokenData<T extends TokenType | null> =
  T extends TokenType.GENERAL ? {id: string; email: string} :
  T extends TokenType.RESET ? {email: string} :
  T extends TokenType.VERIFICATION ? {id: string} :
  T extends TokenType.REFRESH ? {id: string; type: RefreshTokenType} :
  T extends TokenType.EMAIL_UPDATE_VERIFICATION ? {existingEmail: string; newEmail: string} :
  null;


/**
 * Define the argument for the function to generate the token
 * This as well accepts a TokenType generic
 * The TokenType generic is used for the type
 * This is where we tell typescript what TokenType we are using
 * Then we say for the data, we want TokenData, using the given TokenType
 */
export interface TokenArgs<T extends TokenType | null> {
  type: T;
  exp?: number;
  sessionId?: string;
  data: TokenData<T>;
}
