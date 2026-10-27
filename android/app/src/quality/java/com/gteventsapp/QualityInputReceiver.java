package com.gteventsapp;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.ClipData;
import android.content.ClipDescription;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.os.Build;
import android.os.PersistableBundle;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import org.json.JSONObject;

public class QualityInputReceiver extends BroadcastReceiver {
    private static final int MAXIMUM_CREDENTIAL_FILE_BYTES = 4096;

    @Override
    public void onReceive(Context context, Intent intent) {
        setResultCode(Activity.RESULT_CANCELED);
        if (!context.getPackageName().equals("com.yourbusinessplanner.e2e")
                || (context.getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) == 0) {
            return;
        }
        File credentials = new File(context.getFilesDir(), "quality-credentials.json");
        try {
            ClipboardManager clipboard = context.getSystemService(ClipboardManager.class);
            String field = intent.getStringExtra("field");
            if ("clear".equals(field) || "cleanup".equals(field)) {
                clipboard.clearPrimaryClip();
                if ("cleanup".equals(field) && credentials.exists() && !credentials.delete()) {
                    return;
                }
            } else {
                if ((!"username".equals(field) && !"password".equals(field))
                        || !credentials.isFile() || credentials.length() > MAXIMUM_CREDENTIAL_FILE_BYTES) {
                    return;
                }
                JSONObject values = new JSONObject(new String(Files.readAllBytes(credentials.toPath()), StandardCharsets.UTF_8));
                ClipData clip = ClipData.newPlainText("quality-input", values.getString(field));
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    PersistableBundle extras = new PersistableBundle();
                    extras.putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true);
                    clip.getDescription().setExtras(extras);
                }
                clipboard.setPrimaryClip(clip);
            }
            setResultCode(Activity.RESULT_OK);
        } catch (Exception ignored) {
            setResultCode(Activity.RESULT_CANCELED);
        }
    }
}
