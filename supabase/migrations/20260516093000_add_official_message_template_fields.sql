alter table public.whatsapp_channels
add column if not exists official_message_template_name text,
add column if not exists official_message_template_language text default 'en_US';

comment on column public.whatsapp_channels.official_message_template_name is 'Approved WhatsApp Cloud API template name used for official outbound notifications.';
comment on column public.whatsapp_channels.official_message_template_language is 'Approved WhatsApp Cloud API template language code, for example en_US or id_ID.';
