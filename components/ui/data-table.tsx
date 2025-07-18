"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";

interface DataTableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "badge" | "currency";
  color?: string;
}

interface DataTableProps {
  title: string;
  data: Array<Record<string, unknown>>;
  columns: DataTableColumn[];
  className?: string;
}

export function DataTable({
  title,
  data,
  columns,
  className = "",
}: DataTableProps) {
  const getCellValue = (
    item: Record<string, unknown>,
    column: DataTableColumn
  ): ReactNode => {
    const value = item[column.key];

    if (column.type === "badge") {
      return (
        <Badge variant="secondary" className={column.color}>
          {String(value)}
        </Badge>
      );
    }

    if (column.type === "number") {
      return typeof value === "number" ? value.toLocaleString() : String(value);
    }

    if (column.type === "currency") {
      return typeof value === "number"
        ? `$${value.toLocaleString()}`
        : String(value);
    }

    return String(value);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-sm font-medium text-gray-700 ${
                      index === 0 ? "rounded-l-lg" : ""
                    } ${index === columns.length - 1 ? "rounded-r-lg" : ""}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 text-sm ${
                        column.type === "number" ? "text-right" : "text-left"
                      }`}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: "blue" | "green" | "yellow" | "red" | "purple";
  icon?: React.ReactNode;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  color = "blue",
  icon,
}: SummaryCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
          </div>
          {icon && <div className="text-2xl opacity-70">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

interface DataGridProps {
  children: React.ReactNode;
  className?: string;
}

export function DataGrid({ children, className = "" }: DataGridProps) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {children}
    </div>
  );
}
