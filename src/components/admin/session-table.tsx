"use client"

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type AdminSession = {
  id: string;
  token: string;
  userName: string;
  userEmail: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
};

interface SessionTableProps {
  data: AdminSession[];
  onRevoke: (session: AdminSession) => void;
}

export function SessionTable({ data, onRevoke }: SessionTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<AdminSession>[]>(
    () => [
      {
        accessorKey: "userName",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.userName}</div>
            <div className="text-muted-foreground text-xs">{row.original.userEmail}</div>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => row.original.ipAddress || "-",
      },
      {
        accessorKey: "userAgent",
        header: "User Agent",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs">
            {row.original.userAgent || "Unknown"}
          </span>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        cell: ({ row }) =>
          new Date(row.original.expiresAt).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const isExpired = new Date(row.original.expiresAt) < new Date();
          return (
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              {isExpired ? "Expired" : "Active"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(row.original)}
          >
            Revoke
          </Button>
        ),
      },
    ],
    [onRevoke]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
