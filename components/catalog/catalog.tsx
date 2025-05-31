"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Modal } from "../ui/modal";
import { useState } from "react";
import { PencilIcon, TrashIcon } from "../icons";

interface Order {
  number: number;
  title: string;
  category: string;
  language: string;
  count: number;
  categoryCount: number;
  id: string;
  year: number;
  first: string;
  last: string;
  rev: string;
}

export default function Catalog(data: any) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const tableData: Order[] = Array.isArray(data?.data)
    ? data.data.map((item: any) => ({
        number: item.number ?? "",
        title: item.title ?? "",
        category: item.category ?? "",
        language: item.language ?? "",
        count: item.titlecount ?? "",
        categoryCount: item.categorycount ?? "",
        id: item.id ?? "",
        year: item.pubyear ?? "",
        first: item.firstname ?? "",
        last: item.lastname ?? "",
        rev: item.rev ?? ""
      }))
    : [];

  const handleEdit = (id: string) => {
    setSelectedOrderId(id);
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSelectedOrderId(id);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <div className="overflow-hidden bg-white border-[#e5e7eb]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-[#e5e7eb]">
              <TableRow className="">
                <TableCell
                  isHeader
                  className="px-2 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  #
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Title
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 px-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Language
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Category Count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Year
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  First
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Last
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Rev.
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow className="border-b border-[#e5e7eb]" key={order.number}>
                  <TableCell className="py-1 px-2">
                  <div className="font-bold text-gray-500 flex items-center">
                    {order.number}                     
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center truncate" style={{ maxWidth: '18em' }}>
                    {order.title}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.category}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.language}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.count}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.categoryCount}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.id}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.year}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center truncate" style={{ maxWidth: '10em' }}>
                    {order.first}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center truncate" style={{ maxWidth: '10em' }}>
                    {order.last}
                  </div>
                  </TableCell>
                  <TableCell className="px-3 py-1">
                  <div className="text-gray-500 flex items-center">
                    {order.rev}
                  </div>
                  </TableCell>
                  <TableCell className="py-1 px-1">
                  <div 
                    className="hover:bg-yellow-500 py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300"
                    onClick={() => handleEdit(order.id)}
                  >
                    <PencilIcon height={16} color="#6b7280"></PencilIcon>
                  </div>
                  </TableCell>
                  <TableCell className="py-1 pr-1">
                  <div 
                    className="hover:bg-red-500 py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300"
                    onClick={() => handleDelete(order.id)}
                  >
                    <TrashIcon height={16} color="#6b7280"></TrashIcon>
                  </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
        <p>asodgjo;sajgd</p>
      </Modal>
    </div>
    
  );
}
