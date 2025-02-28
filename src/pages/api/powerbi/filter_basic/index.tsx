import * as models from 'powerbi-models'
import * as pbi from 'powerbi-client'

export default async function FilterBasic(
  tables: string[],
  columns: string[],
  operators: pbi.models.BasicFilterOperators[],
  values: (string | number | boolean)[],
  report: pbi.Report | undefined
) {
  const buildFilterConfigurations = async (
    tables: string[],
    columns: string[],
    operators: pbi.models.BasicFilterOperators[],
    values: (string | number | boolean)[]
  ) => {
    const filters: pbi.models.IBasicFilter[] = []
    let i = 0

    do {
      const filter: pbi.models.IBasicFilter = {
        $schema: 'http://powerbi.com/product/schema#basic',
        filterType: models.FilterType.Basic,
        target: {
          table: tables[i],
          column: columns[i]
        },
        operator: operators[i],
        values: values
      }

      filters.push(filter)
      i++
    } while (i < tables.length)

    return filters
  }

  const createFilter = async (
    report: pbi.Report | undefined,
    operation: pbi.models.FiltersOperations,
    filters: pbi.models.IBasicFilter[]
  ) => {
    try {
      if (report) {
        await report.updateFilters(operation, filters)
      }
    } catch (errors) {
      console.log(errors)
    }
  }

  const createdFilters = await buildFilterConfigurations(tables, columns, operators, values)

  await createFilter(report, models.FiltersOperations.Replace, createdFilters)
}
