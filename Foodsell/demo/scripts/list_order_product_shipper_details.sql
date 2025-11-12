-- Detailed metadata report for tables matching keywords: order, checkout, product, shipper
-- Database: food_delivery_db10
USE [food_delivery_db10];
GO

PRINT '== Tables matching keywords: order, checkout, product, shipper (case-insensitive) ==';

-- Collect matching tables
IF OBJECT_ID('tempdb..#matching_tables') IS NOT NULL DROP TABLE #matching_tables;
CREATE TABLE #matching_tables(
    schema_name SYSNAME,
    table_name SYSNAME,
    full_name NVARCHAR(400)
);

INSERT INTO #matching_tables(schema_name, table_name, full_name)
SELECT s.name, t.name, QUOTENAME(s.name) + '.' + QUOTENAME(t.name)
FROM sys.tables t
JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE LOWER(t.name) LIKE '%order%'
   OR LOWER(t.name) LIKE '%checkout%'
   OR LOWER(t.name) LIKE '%product%'
   OR LOWER(t.name) LIKE '%shipper%'
ORDER BY s.name, t.name;

SELECT * FROM #matching_tables;
GO

-- For each matching table print detailed metadata
DECLARE @schema SYSNAME, @table SYSNAME, @fullname NVARCHAR(400);

DECLARE table_cursor CURSOR FOR
SELECT schema_name, table_name, full_name FROM #matching_tables;

OPEN table_cursor;
FETCH NEXT FROM table_cursor INTO @schema, @table, @fullname;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '-----------------------------------------------------------------';
    PRINT 'Table: ' + @fullname;
    PRINT '-----------------------------------------------------------------';

    -- Columns
    PRINT '-- Columns --';
    SELECT
        c.column_id AS ordinal_position,
        c.name AS column_name,
        TYPE_NAME(c.user_type_id) AS data_type,
        CASE WHEN t.name IN ('varchar','nvarchar','char','nchar') THEN c.max_length
             WHEN t.name IN ('decimal','numeric') THEN CONCAT(c.precision,',',c.scale)
             ELSE c.max_length END AS length_or_precision,
        CASE WHEN c.is_nullable = 1 THEN 'YES' ELSE 'NO' END AS is_nullable,
        OBJECT_DEFINITION(c.default_object_id) AS column_default,
        ep.value AS column_description
    FROM sys.columns c
    LEFT JOIN sys.types t ON c.user_type_id = t.user_type_id
    LEFT JOIN sys.extended_properties ep ON ep.major_id = c.object_id AND ep.minor_id = c.column_id AND ep.name = 'MS_Description'
    WHERE c.object_id = OBJECT_ID(@fullname)
    ORDER BY c.column_id;

    -- Primary key
    PRINT '-- Primary Key --';
    SELECT
        i.name AS pk_name,
        ic.key_ordinal,
        COL_NAME(ic.object_id, ic.column_id) AS column_name
    FROM sys.indexes i
    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.object_id = OBJECT_ID(@fullname) AND i.is_primary_key = 1
    ORDER BY ic.key_ordinal;

    -- Foreign keys (outgoing) from this table
    PRINT '-- Foreign Keys (this table -> referenced table) --';
    SELECT
        fk.name AS fk_name,
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS fk_column,
        QUOTENAME(rs.name) + '.' + QUOTENAME(rt.name) AS referenced_table,
        COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables rt ON fkc.referenced_object_id = rt.object_id
    JOIN sys.schemas rs ON rt.schema_id = rs.schema_id
    WHERE fk.parent_object_id = OBJECT_ID(@fullname)
    ORDER BY fk.name, fkc.constraint_column_id;

    -- Foreign keys (incoming) referencing this table
    PRINT '-- Foreign Keys (other tables -> this table) --';
    SELECT
        fk.name AS fk_name,
        QUOTENAME(ps.name) + '.' + QUOTENAME(pt.name) AS referencing_table,
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS referencing_column,
        COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS referenced_column
    FROM sys.foreign_keys fk
    JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
    JOIN sys.tables pt ON fkc.parent_object_id = pt.object_id
    JOIN sys.schemas ps ON pt.schema_id = ps.schema_id
    WHERE fkc.referenced_object_id = OBJECT_ID(@fullname)
    ORDER BY fk.name, fkc.constraint_column_id;

    -- Indexes (non-PK)
    PRINT '-- Indexes (non-PK) --';
    SELECT
        i.name AS index_name,
        i.is_unique,
        i.is_unique_constraint,
        i.type_desc,
        ic.index_column_id,
        COL_NAME(ic.object_id, ic.column_id) AS column_name,
        ic.is_included_column
    FROM sys.indexes i
    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    WHERE i.object_id = OBJECT_ID(@fullname) AND i.is_primary_key = 0
    ORDER BY i.name, ic.index_column_id;

    -- Constraints (CHECK, DEFAULT, UNIQUE) - except PK/FK (some shown above)
    PRINT '-- Constraints --';
    SELECT
        con.name AS constraint_name,
        con.type_desc,
        OBJECT_DEFINITION(con.object_id) AS definition
    FROM sys.check_constraints con
    WHERE con.parent_object_id = OBJECT_ID(@fullname)
    ORDER BY con.name;

    -- Sample data (commented out by default) - uncomment if you want to run
    -- PRINT '-- Sample rows (TOP 10) --';
    -- DECLARE @sql NVARCHAR(MAX) = N'SELECT TOP(10) * FROM ' + @fullname + N';';
    -- EXEC sp_executesql @sql;

    FETCH NEXT FROM table_cursor INTO @schema, @table, @fullname;
END

CLOSE table_cursor;
DEALLOCATE table_cursor;

PRINT '== Done ==';
GO
