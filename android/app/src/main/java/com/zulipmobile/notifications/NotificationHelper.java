package com.zulipmobile.notifications;

import android.app.Notification;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.StyleSpan;
import android.util.Log;
import android.util.TypedValue;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

import com.zulipmobile.R;

public class NotificationHelper {
    static final String TAG = "ZulipNotif";

    /**
     * The Zulip messages we're showing as a notification, grouped by conversation.
     *
     * Each key identifies a conversation; see @{link buildKeyString}.
     *
     * Each value is the messages in the conversation, in the order we
     * received them.
     */
    public static final class ConversationMap
            extends LinkedHashMap<String, List<MessageInfo>> {}

    static Bitmap fetch(URL url) throws IOException {
        Log.i(TAG, "GAFT.fetch: Getting gravatar from url: " + url);
        URLConnection connection = url.openConnection();
        connection.setUseCaches(true);
        Object response = connection.getContent();
        if (response instanceof InputStream) {
            return BitmapFactory.decodeStream((InputStream) response);
        }
        return null;
    }

    static URL sizedURL(Context context, String url, float dpSize) {
        // From http://stackoverflow.com/questions/4605527/
        Resources r = context.getResources();
        float px = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP,
                dpSize, r.getDisplayMetrics());
        try {
            return new URL(url + "&s=" + px);
        } catch (MalformedURLException e) {
            Log.e(TAG, "ERROR: " + e.toString());
            return null;
        }
    }


    private static String extractName(String key) {
        return key.split(":")[0];
    }

    static void buildNotificationContent(ConversationMap conversations, Notification.InboxStyle inboxStyle, Context mContext) {
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            String name = extractName(entry.getKey());
            List<MessageInfo> messages = entry.getValue();
            Spannable sb = new SpannableString(String.format(Locale.ENGLISH, "%s%s: %s", name,
                    mContext.getResources().getQuantityString(R.plurals.messages,messages.size(),messages.size()),
                   messages.get(entry.getValue().size() - 1).getContent()));
            sb.setSpan(new StyleSpan(android.graphics.Typeface.BOLD), 0, name.length(), Spannable.SPAN_EXCLUSIVE_EXCLUSIVE);
            inboxStyle.addLine(sb);
        }
    }

    static int extractTotalMessagesCount(ConversationMap conversations) {
        int totalNumber = 0;
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            totalNumber += entry.getValue().size();
        }
        return totalNumber;
    }

    /**
     * Formats -
     * stream message - fullName:streamName:'stream'
     * group message - fullName:Recipients:'group'
     * private message - fullName:Email:'private'
     */
    private static String buildKeyString(MessageFcmMessage fcmMessage) {
        final Recipient recipient = fcmMessage.getRecipient();
        if (recipient instanceof Recipient.Stream)
            return String.format("%s:%s:stream", fcmMessage.getSender().getFullName(),
                    ((Recipient.Stream) recipient).getStream());
        else if (recipient instanceof Recipient.GroupPm) {
            return String.format("%s:%s:group", fcmMessage.getSender().getFullName(),
                    ((Recipient.GroupPm) recipient).getPmUsers());
        } else {
            return String.format("%s:%s:private", fcmMessage.getSender().getFullName(),
                    fcmMessage.getSender().getEmail());
        }
    }

    static String[] extractNames(ConversationMap conversations) {
        String[] names = new String[conversations.size()];
        int index = 0;
        for (Map.Entry<String, List<MessageInfo>> entry : conversations.entrySet()) {
            names[index++] = entry.getKey().split(":")[0];
        }
        return names;
    }

    static void addConversationToMap(MessageFcmMessage fcmMessage, ConversationMap conversations) {
        String key = buildKeyString(fcmMessage);
        List<MessageInfo> messages = conversations.get(key);
        MessageInfo messageInfo = new MessageInfo(fcmMessage.getContent(), fcmMessage.getZulipMessageId());
        if (messages == null) {
            messages = new ArrayList<>();
        }
        messages.add(messageInfo);
        conversations.put(key, messages);
    }

    static void removeMessagesFromMap(ConversationMap conversations, Set<Integer> messageIds) {
        // We don't have the information to compute what key we ought to find each message under,
        // so just walk the whole thing.  If the user has >100 notifications, this linear scan
        // won't be their worst problem anyway...
        //
        // TODO redesign this whole data structure, for many reasons.
        final Iterator<List<MessageInfo>> it = conversations.values().iterator();
        while (it.hasNext()) {
            final List<MessageInfo> messages = it.next();
            for (int i = messages.size() - 1; i >= 0; --i) {
                if (messageIds.contains(messages.get(i).getMessageId())) {
                    messages.remove(i);
                }
            }
            if (messages.isEmpty()) {
                it.remove();
            }
        }
    }

    static void clearConversations(ConversationMap conversations) {
        conversations.clear();
    }
}
