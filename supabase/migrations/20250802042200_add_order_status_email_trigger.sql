-- Function to handle sending emails on order status change
create or replace function handle_order_status_change()
returns trigger as $$
declare
  email_payload json;
begin
  -- Email for the customer on any status change
  select json_build_object(
    'to', new.customer_email,
    'from', 'ElegantShop <noreply@example.com>',
    'subject', 'Your Order #' || new.id || ' has been updated to: ' || new.status,
    'html', '<h1>Order Status Update</h1><p>Hi ' || new.customer_name || ',</p><p>The status of your order #' || new.id || ' has been updated to <strong>' || new.status || '</strong>.</p><p>You can view your order details here: <a href="https://your-store-url.com/orders/' || new.id || '">View Order</a></p><p>Thank you for shopping with us!</p>'
  ) into email_payload;

  perform net.http_post(
    url:='https://kjnnelyffqesrmruohce.supabase.co/functions/v1/send-email',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}',
    body:=email_payload
  );

  -- Email for the admin when shipped or delivered
  if new.status = 'shipped' or new.status = 'delivered' then
    select json_build_object(
      'to', 'admin@example.com',
      'from', 'ElegantShop <noreply@example.com>',
      'subject', 'Order #' || new.id || ' has been ' || new.status,
      'html', '<h1>Order ' || new.status || '</h1><p>Order #' || new.id || ' for customer ' || new.customer_name || ' has been marked as ' || new.status || '.</p><a href="https://your-store-url.com/admin/orders/' || new.id || '">View Order Details</a>'
    ) into email_payload;

    perform net.http_post(
        url:='https://kjnnelyffqesrmruohce.supabase.co/functions/v1/send-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer " || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}',
        body:=email_payload
    );
  end if;

  return new;
end;
$$ language plpgsql;

-- Trigger to call the function on order status update
create trigger on_order_status_update
  after update of status on orders
  for each row
  when (old.status is distinct from new.status)
  execute procedure handle_order_status_change();
