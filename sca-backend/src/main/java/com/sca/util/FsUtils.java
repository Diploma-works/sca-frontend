package com.sca.util;

import java.nio.file.Path;

public class FsUtils {
    public static String getExtension(Path path) {
        String name = path.getFileName().toString();
        int dot = name.lastIndexOf(".");
        return dot == -1 ? "" : name.substring(dot + 1).toLowerCase();
    }
}
