package net.nanthrax.moussaillon.services;

import io.quarkus.elytron.security.common.BcryptUtil;

public final class PasswordUtil {

    private PasswordUtil() {
    }

    public static String hash(String plaintext) {
        return BcryptUtil.bcryptHash(plaintext);
    }

    public static boolean verify(String plaintext, String storedHash) {
        if (storedHash == null || plaintext == null) {
            return false;
        }
        if (isBcrypt(storedHash)) {
            return BcryptUtil.matches(plaintext, storedHash);
        }
        // Legacy plaintext comparison (migration)
        return plaintext.equals(storedHash);
    }

    public static boolean needsRehash(String storedHash) {
        return storedHash != null && !isBcrypt(storedHash);
    }

    private static boolean isBcrypt(String hash) {
        return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
    }

}
