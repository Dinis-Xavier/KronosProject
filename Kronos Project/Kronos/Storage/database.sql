create table profiles (
  id uuid references auth.users(id) on delete cascade,
  role text not null default 'user',
  created_at timestamp with time zone default now(),
  primary key (id)
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    brand text not null,
    model text,
    description text,
    price numeric(10,2) not null,
    stock integer default 0,
    movement_type text,
    case_material text,
    strap_material text,
    case_diameter numeric(5,2),
    water_resistant text,
    image text,
    created_at timestamp with time zone default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  total numeric(10,2) not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  quantity integer not null,
  price numeric(10,2) not null
);


alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;


create policy "User can read own profile"
on profiles
for select
using (id = auth.uid());


create policy "No self role update"
on profiles
for update
using (false);


create policy "Admins can update roles"
on profiles
for update
using (
  exists (
    select 1 from profiles p
    where p.id = auth.uid()
    and p.role = 'admin'
  )
);

create policy "Public can read products"
on products
for select
using (true);

create policy "Admins can manage products"
on products
for all
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);



create policy "User can read own orders"
on orders
for select
using (user_id = auth.uid());


create policy "Admin can read all orders"
on orders
for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "User can create orders"
on orders
for insert
with check (user_id = auth.uid());


create policy "User can read own order items"
on order_items
for select
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);


create policy "Admin can read all order items"
on order_items
for select
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

create policy "Public read watches images"
on storage.objects
for select
using (bucket_id = 'Watches-Images');


create policy "Admins can upload watches images"
on storage.objects
for insert
with check (
  bucket_id = 'Watches-Images'
  AND auth.jwt() ->> 'role' = 'authenticated'
);