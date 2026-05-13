alter table workloads drop constraint if exists workloads_selected_provider_id_fkey;
alter table routing_decisions drop constraint if exists routing_decisions_winner_provider_id_fkey;

