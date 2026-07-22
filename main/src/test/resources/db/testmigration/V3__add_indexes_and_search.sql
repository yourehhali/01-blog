create index idx_users_active on users(active);
create index idx_users_created on users(created_at);

create index idx_posts_published_hidden_created on posts(published, hidden_by_admin, created_at desc);
create index idx_posts_author_created on posts(author_id, created_at desc);
create index idx_posts_hidden_created on posts(hidden_by_admin, created_at desc);
create index idx_post_media_post on post_media_urls(post_id);

create index idx_comments_post_created on comments(post_id, created_at);
create index idx_comments_author on comments(author_id);

create index idx_likes_post on likes(post_id);
create index idx_likes_user on likes(user_id);

create index idx_subscriptions_subscriber on subscriptions(subscriber_id);
create index idx_subscriptions_target on subscriptions(target_id);

create index idx_notifications_recipient_created on notifications(recipient_id, created_at desc);
create index idx_notifications_recipient_read_created on notifications(recipient_id, is_read, created_at desc);

create index idx_reports_created on reports(created_at desc);
create index idx_reports_reporter on reports(reporter_id);
create index idx_reports_type_target on reports(report_type, target_id);

create index idx_refresh_tokens_user on refresh_tokens(user_id);
create index idx_refresh_tokens_expiry on refresh_tokens(expiry);
