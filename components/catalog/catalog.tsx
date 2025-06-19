"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Modal } from "../ui/modal";
import { ConfirmDeleteModal } from "../ui/confirm-delete-modal";
import { EditItemModal, EditableItem } from "../ui/edit-item-modal";
import { useState } from "react";
import { PencilIcon, TrashIcon, CheckoutIcon, ReturnIcon } from "../icons";
import { deleteProduct, updateProduct, checkoutBook, returnBook } from "../../app/(dashboard)/actions";

interface Order {
  number: number;
  title: string;
  category: string;
  language: string | string[]; // Updated to handle both string and array types
  count: number;
  categoryCount: number;
  categoryIndex: number;
  id: string;
  year: number;
  first: string;
  last: string;
  rev: string | string[]; // Updated to handle both string and array types
  editedtranslated: string | string[] | null; // Add missing field
  isCheckedOut?: boolean; // Checkout status
  checkedOutByCurrentUser?: boolean; // Whether current user has checked it out
}

export default function Catalog({ data, isAdmin = false }: { data: any; isAdmin?: boolean }) {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderTitle, setSelectedOrderTitle] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<EditableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [checkoutStates, setCheckoutStates] = useState<{ [key: string]: boolean }>({});

  // Since data is already a flat array when passed from products-page-client,
  // we don't need to navigate nested properties
  const actualData = Array.isArray(data) ? data : [];
  
  const tableData: Order[] = Array.isArray(actualData)
    ? actualData.map((item: any) => ({
        number: item.number ?? "",
        title: item.title ?? "",
        category: item.category ?? "",
        language: item.language ?? "",
        count: item.titlecount ?? "",
        categoryCount: item.categorycount ?? "",
        categoryIndex: item.categoryindex ?? "",
        id: item.id ?? "",
        year: item.pubyear ?? "",
        first: item.firstname ?? "",
        last: item.lastname ?? "",
        rev: item.rev ?? "",
        editedtranslated: item.editedtranslated ?? "",
        isCheckedOut: item.isCheckedOut ?? false,
        checkedOutByCurrentUser: item.checkedOutByCurrentUser ?? false
      }))
    : [];

  // Extract pagination info if available
  const paginationInfo = data?.data?.pagination || data?.pagination || null;
  const currentStart = paginationInfo ? (paginationInfo.page - 1) * paginationInfo.pageSize + 1 : 1;
  const currentEnd = paginationInfo ? Math.min(paginationInfo.page * paginationInfo.pageSize, paginationInfo.total) : tableData.length;

  const handleEdit = (order: Order) => {
    const editableItem: EditableItem = {
      title: order.title,
      category: order.category,
      language: order.language,
      year: order.year,
      first: order.first,
      last: order.last,
      editedtranslated: order.editedtranslated
    };
    
    setSelectedItem(editableItem);
    setSelectedOrderId(order.id); // Store the ID separately
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (item: EditableItem) => {
    setIsEditing(true);
    try {
      const formData = new FormData();
      formData.append('id', selectedOrderId || ''); // Use the stored ID
      formData.append('title', item.title);
      formData.append('category', item.category);
      formData.append('language', Array.isArray(item.language) ? item.language.join(', ') : item.language);
      formData.append('year', item.year ? item.year.toString() : '');
      formData.append('firstname', item.first || '');
      formData.append('lastname', item.last || '');
      // The editedtranslated form field maps to the 'editedtranslated' database column
      formData.append('editedtranslated', Array.isArray(item.editedtranslated) ? item.editedtranslated.join(', ') : (item.editedtranslated || ''));
      
      const result = await updateProduct(formData);
      
      if (result.success) {
        setEditModalOpen(false);
        setSelectedItem(null);
        setSelectedOrderId(null); // Clear the stored ID
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Failed to update item: ${result.error}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('An error occurred while updating the item');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    setSelectedOrderId(id);
    setSelectedOrderTitle(title);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrderId) return;
    
    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', selectedOrderId);
      
      const result = await deleteProduct(formData);
      
      if (result.success) {
        // Close modal and reset state
        setDeleteModalOpen(false);
        setSelectedOrderId(null);
        setSelectedOrderTitle(null);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Failed to delete item: ${result.error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting the item');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeEditModal = () => {
    if (!isEditing) {
      setEditModalOpen(false);
      setSelectedItem(null);
      setSelectedOrderId(null); // Clear the stored order ID
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setSelectedOrderId(null);
      setSelectedOrderTitle(null);
    }
  };

  const handleCheckout = async (bookId: string) => {
    setCheckoutStates(prev => ({ ...prev, [bookId]: true }));
    try {
      const formData = new FormData();
      formData.append('bookId', bookId);
      
      const result = await checkoutBook(formData);
      
      if (result.success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Failed to checkout book: ${result.error}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred while checking out the book');
    } finally {
      setCheckoutStates(prev => ({ ...prev, [bookId]: false }));
    }
  };

  const handleReturn = async (bookId: string) => {
    setCheckoutStates(prev => ({ ...prev, [bookId]: true }));
    try {
      const formData = new FormData();
      formData.append('bookId', bookId);
      
      const result = await returnBook(formData);
      
      if (result.success) {
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert(`Failed to return book: ${result.error}`);
      }
    } catch (error) {
      console.error('Return error:', error);
      alert('An error occurred while returning the book');
    } finally {
      setCheckoutStates(prev => ({ ...prev, [bookId]: false }));
    }
  };

  return (
    <div className="overflow-hidden bg-white border-[#e5e7eb]">
      {/* Pagination info header */}
      {paginationInfo && (
        <div className="px-4 py-2 border-b border-[#e5e7eb] bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {currentStart}-{currentEnd} of {paginationInfo.total} results
            </span>
            <span>
              Page {paginationInfo.page} of {paginationInfo.totalPages}
            </span>
          </div>
        </div>
      )}
      
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
                  Cat. Count
                </TableCell>
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Cat. Index
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
                <TableCell
                  isHeader
                  className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                {isAdmin && (
                  <>
                    <TableCell
                      isHeader
                      className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Edit
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Delete
                    </TableCell>
                  </>
                )}
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
                    {Array.isArray(order.language) 
                      ? order.language.join(', ') 
                      : order.language
                    }
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
                      {order.categoryIndex}
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
                    {order.editedtranslated && (Array.isArray(order.editedtranslated) 
                      ? order.editedtranslated.join(', ') 
                      : order.editedtranslated)
                    }
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-1">
                    {order.checkedOutByCurrentUser ? (
                      <div 
                        className={`py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                          checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-blue-500'
                        }`}
                        onClick={() => !checkoutStates[order.number.toString()] && handleReturn(order.number.toString())}
                      >
                        <ReturnIcon height={16} color="#6b7280"></ReturnIcon>
                      </div>
                    ) : order.isCheckedOut ? (
                      <div className="py-1 border-[#6b7280] border rounded flex justify-center items-center text-xs text-gray-500">
                        Checked Out
                      </div>
                    ) : (
                      <div 
                        className={`py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                          checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-green-500'
                        }`}
                        onClick={() => !checkoutStates[order.number.toString()] && handleCheckout(order.number.toString())}
                      >
                        <CheckoutIcon height={16} color="#6b7280"></CheckoutIcon>
                      </div>
                    )}
                  </TableCell>
                  {isAdmin && (
                    <>
                      <TableCell className="py-1 px-1">
                      <div 
                        className="hover:bg-yellow-500 py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                        onClick={() => handleEdit(order)}
                      >
                        <PencilIcon height={16} color="#6b7280"></PencilIcon>
                      </div>
                      </TableCell>
                      <TableCell className="py-1 pr-1">
                      <div 
                        className="hover:bg-red-500 py-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                        onClick={() => handleDelete(order.id, order.title)}
                      >
                        <TrashIcon height={16} color="#6b7280"></TrashIcon>
                      </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination summary at bottom */}
      {paginationInfo && (
        <div className="px-4 py-2 border-t border-[#e5e7eb] bg-gray-50">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              {tableData.length} items displayed
            </span>
            <span>
              Total: {paginationInfo.total} records
            </span>
          </div>
        </div>
      )}
      
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSaveEdit}
        item={selectedItem}
        isEditing={isEditing}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Catalog Item"
        itemName={selectedOrderTitle || undefined}
        isDeleting={isDeleting}
      />
    </div>
    
  );
}
