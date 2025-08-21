import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('wb_box_tariffs_daily', (t) => {
    t.increments('id').primary();
    t.date('tariff_date').notNullable();
    t.text('warehouse_name').notNullable();
    t.text('geo_name').nullable();

    t.text('box_delivery_and_storage_expr').nullable();

    t.decimal('box_delivery_base', 12, 3).nullable();
    t.decimal('box_delivery_coef_expr', 12, 3).nullable();
    t.decimal('box_delivery_liter', 12, 3).nullable();

    t.decimal('box_delivery_marketplace_base', 12, 3).nullable();
    t.decimal('box_delivery_marketplace_coef_expr', 12, 3).nullable();
    t.decimal('box_delivery_marketplace_liter', 12, 3).nullable();

    t.decimal('box_storage_base', 12, 3).nullable();
    t.decimal('box_storage_coef_expr', 12, 3).nullable();
    t.decimal('box_storage_liter', 12, 3).nullable();

    t.date('dt_next_box').nullable();
    t.date('dt_till_max').nullable();

    t.timestamp('last_fetched_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    t.timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    t.unique(['tariff_date', 'warehouse_name'], {
      indexName: 'wb_box_tariffs_daily_uq',
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wb_box_tariffs_daily');
}
