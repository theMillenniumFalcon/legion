import { createCipheriv, createDecipheriv } from 'crypto';

export const encryptSecret = (secret: string) => {
    const cipher = createCipheriv('aes256', process.env.SECRETS_KEY, process.env.SECRETS_IV)
    return cipher.update(secret, 'utf-8', 'hex') + cipher.final('hex')
}

export const decryptSecret = (secret: string) => {
    const decipher = createDecipheriv('aes256', process.env.SECRETS_KEY, process.env.SECRETS_IV)
    const decrypted = decipher.update(secret, 'hex', 'utf-8') + decipher.final('utf-8')
    return decrypted.toString()
}