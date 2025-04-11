-- Criar tabela de perfis de usuário
create table public.profiles (
    id uuid references auth.users on delete cascade,
    name text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Habilitar RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Criar política para permitir leitura pública
create policy "Permitir leitura pública dos perfis"
    on public.profiles for select
    using ( true );

-- Criar política para permitir atualização apenas pelo próprio usuário
create policy "Usuários podem atualizar seus próprios perfis"
    on public.profiles for update
    using ( auth.uid() = id );

-- Criar política para permitir inserção apenas pelo próprio usuário
create policy "Usuários podem inserir seus próprios perfis"
    on public.profiles for insert
    with check ( auth.uid() = id );

-- Criar função para atualizar o timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Criar trigger para atualizar o timestamp
create trigger handle_updated_at
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at(); 