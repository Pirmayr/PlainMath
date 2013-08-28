// Version 20

package org.pirmayr.PlainMath;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;
import android.webkit.WebView;
import android.widget.Toast;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class MainActivity extends Activity {
    class ClsAccessor {
        public double printHTML(String html) {
            try {
                doPrintHTML(html);
            } catch (Exception e) {
                handleException(e);
            }
            return 0.0;
        }
    }

    private ClsAccessor accessor = new ClsAccessor();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        try {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.main);

            WebView mainWebView = (WebView) findViewById(R.id.mainWebView);

            mainWebView.getSettings().setJavaScriptEnabled(true);
            mainWebView.getSettings().setDomStorageEnabled(true);
            mainWebView.getSettings().setDatabaseEnabled(true);
            mainWebView.getSettings().setDatabasePath("/data/data/org.pirmayr.PlainMath/databases/");
            mainWebView.setScrollBarStyle(View.SCROLLBARS_OUTSIDE_OVERLAY);
            mainWebView.addJavascriptInterface(accessor, "accessor");
            mainWebView.loadUrl("file:///android_asset/EasyMath.html");
        } catch (Exception e) {
            handleException(e);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        return true;
    }

    private Boolean debuggerActive() {
        try {
            return (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception ignored) {
        }
        return false;
    }

    private void handleException(Exception exception) {
        try {
            if (debuggerActive()) {
                showMsg("Exception:\r\n\r\n" + exception.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void showMsg(String text) {
        try {
            Toast.makeText(getApplicationContext(), text, Toast.LENGTH_LONG).show();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void doPrintHTML(String html) {
        String path = getExternalFilesDir(null) + "/_print.html";

        if (writeToFile(html, path)) {
            Intent printIntent = new Intent(this, PrintDialogActivity.class);
            printIntent.setDataAndType(Uri.fromFile(new File(path)), "text/html");
            printIntent.putExtra("title", "hugo");
            startActivity(printIntent);
        }
    }

    private boolean writeToFile(String data, String path) {
        try {
            FileWriter writer = new FileWriter(path);
            writer.write(data);
            writer.close();

            return true;
        } catch (IOException e) {
            handleException(e);
        }

        return false;
    }
}
