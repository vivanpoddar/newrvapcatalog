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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, ReturnIcon, BookIcon, InfoIcon } from "../icons";
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
  checkoutDetails?: {
    user_id: string;
    checked_out_at: string;
    userDisplay: string;
    userEmail: string;
    userPhone: string;
    checkedOutDate: string;
  } | null; // Details about who checked it out and when
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
  const [showCheckoutDetails, setShowCheckoutDetails] = useState<{ [key: string]: boolean }>({});

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
        checkedOutByCurrentUser: item.checkedOutByCurrentUser ?? false,
        checkoutDetails: item.checkoutDetails ?? null
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

  const toggleCheckoutDetails = (orderId: string) => {
    setShowCheckoutDetails(prev => ({ 
      ...prev, 
      [orderId]: !prev[orderId] 
    }));
  };

  // Close checkout details when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-checkout-details]')) {
        setShowCheckoutDetails({});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="overflow-hidden bg-white border-[#e5e7eb]">
      
      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        <div className="space-y-3 p-4">
          {tableData.map((order) => (
            <div 
              key={order.number} 
              className={`p-4 border rounded-lg shadow-sm ${order.isCheckedOut ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-900 text-lg">#{order.number}</div>
                <div className="flex gap-2 items-center">
                  {order.checkedOutByCurrentUser ? (
                    <div 
                      className={`p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                        checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-blue-500'
                      }`}
                      onClick={() => !checkoutStates[order.number.toString()] && handleReturn(order.number.toString())}
                    >
                      <ReturnIcon height={16} color="#6b7280"></ReturnIcon>
                    </div>
                  ) : order.isCheckedOut && order.checkoutDetails ? (
                    <div 
                      className="p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleCheckoutDetails(order.id)}
                      data-checkout-details
                    >
                      <InfoIcon height={16} color="#6b7280" />
                    </div>
                  ) : order.isCheckedOut ? (
                    <div className="hover:bg-red-500 p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer">
                      <InfoIcon height={16} color="#6b7280" />
                    </div>
                  ) : (
                    <div 
                      className={`p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                        checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-green-500'
                      }`}
                      onClick={() => !checkoutStates[order.number.toString()] && handleCheckout(order.number.toString())}
                    >
                      <BookIcon height={16} color="#6b7280"></BookIcon>
                    </div>
                  )}
                  {isAdmin && (
                    <>
                      <div 
                        className="hover:bg-yellow-500 p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                        onClick={() => handleEdit(order)}
                      >
                        <PencilIcon height={16} color="#6b7280"></PencilIcon>
                      </div>
                      <div 
                        className="hover:bg-red-500 p-2 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                        onClick={() => handleDelete(order.id, order.title)}
                      >
                        <TrashIcon height={16} color="#6b7280"></TrashIcon>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <div className="font-semibold text-gray-900 text-base mb-1">{order.title}</div>
                  <div className="text-sm text-gray-600">{order.category}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Language:</span>
                    <div className="text-gray-700">
                      {Array.isArray(order.language) ? order.language.join(', ') : order.language}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Year:</span>
                    <div className="text-gray-700">{order.year}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Author:</span>
                    <div className="text-gray-700">{order.first} {order.last}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">ID:</span>
                    <div className="text-gray-700">{order.id}</div>
                  </div>
                </div>
                
                {order.checkedOutByCurrentUser && (
                  <div className="text-xs text-blue-600 mt-2 font-medium">
                    You have checked out this book
                  </div>
                )}
                
                {order.isCheckedOut && order.checkoutDetails && showCheckoutDetails[order.id] && (
                  <div className="mt-3 p-3 bg-gray-50 border rounded-md" data-checkout-details>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-800">{order.checkoutDetails.userDisplay}</div>
                      {order.checkoutDetails.userEmail && (
                        <div className="text-xs text-gray-600">{order.checkoutDetails.userEmail}</div>
                      )}
                      {order.checkoutDetails.userPhone && (
                        <div className="text-xs text-gray-600">{order.checkoutDetails.userPhone}</div>
                      )}
                      <div className="text-xs text-gray-500">Since {order.checkoutDetails.checkedOutDate}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet/Desktop Table Layout */}
      <div className="hidden md:block">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px] lg:min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-[#e5e7eb]">
                <TableRow className="">
                  <TableCell
                    isHeader
                    className="px-2 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    #
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Title
                  </TableCell>
                  <TableCell
                    isHeader
                    className="py-3 px-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden lg:table-cell"
                  >
                    Language
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden xl:table-cell"
                  >
                    Count
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden xl:table-cell"
                  >
                    Cat. Count
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden xl:table-cell"
                  >
                    Cat. Index
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden lg:table-cell"
                  >
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Year
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
                  >
                    Author
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 hidden xl:table-cell"
                  >
                    Rev.
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {tableData.map((order) => (
                  <TableRow className={`border-b border-[#e5e7eb] ${order.isCheckedOut ? "bg-amber-50" : ""}`} key={order.number}>
                    <TableCell className="py-2 px-2">
                      <div className="font-bold text-gray-500 flex items-center">
                        {order.number}                     
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-gray-500 flex items-center truncate max-w-[200px] md:max-w-[250px]">
                        {order.title}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-gray-500 flex items-center truncate max-w-[120px]">
                        {order.category}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden lg:table-cell">
                      <div className="text-gray-500 flex items-center truncate max-w-[100px]">
                        {Array.isArray(order.language) 
                          ? order.language.join(', ') 
                          : order.language
                        }
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden xl:table-cell">
                      <div className="text-gray-500 flex items-center">
                        {order.count}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden xl:table-cell">
                      <div className="text-gray-500 flex items-center">
                        {order.categoryCount}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden xl:table-cell">
                      <div className="text-gray-500 flex items-center">
                        {order.categoryIndex}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden lg:table-cell">
                      <div className="text-gray-500 flex items-center truncate max-w-[80px]">
                        {order.id}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-gray-500 flex items-center">
                        {order.year}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="text-gray-500 flex items-center truncate max-w-[120px]">
                        {order.first} {order.last}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 hidden xl:table-cell">
                      <div className="text-gray-500 flex items-center truncate max-w-[100px]">
                        {order.editedtranslated && (Array.isArray(order.editedtranslated) 
                          ? order.editedtranslated.join(', ') 
                          : order.editedtranslated)
                        }
                      </div>
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <div className="flex gap-1 items-center">
                        {order.checkedOutByCurrentUser ? (
                          <div className="space-y-1">
                            <div 
                              className={`p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                                checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-blue-500'
                              }`}
                              onClick={() => !checkoutStates[order.number.toString()] && handleReturn(order.number.toString())}
                            >
                              <ReturnIcon height={14} color="#6b7280"></ReturnIcon>
                            </div>
                          </div>
                        ) : order.isCheckedOut && order.checkoutDetails ? (
                          <div className="space-y-1 relative">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="hover:bg-white p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                                    onClick={() => toggleCheckoutDetails(order.id)}
                                    data-checkout-details
                                  >
                                    <InfoIcon height={14} color="#6b7280" />
                                  </div>                          
                                </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1">
                                  <div className="text-s font-bold leading-none ">{order.checkoutDetails.userDisplay}</div>
                                  {order.checkoutDetails.userEmail && (
                                      <div className="text-xs leading-none text-muted-foreground">{order.checkoutDetails.userEmail}</div>
                                  )}
                                  {order.checkoutDetails.userPhone && (
                                      <div className="text-xs leading-none text-muted-foreground">{order.checkoutDetails.userPhone}</div>
                                  )}
                                    <div className="text-xs leading-none text-muted-foreground">Since {order.checkoutDetails.checkedOutDate}</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            {showCheckoutDetails[order.id] && (
                              <div className="absolute z-10 mt-1 right-0 p-2 bg-white border border-gray-200 rounded-md shadow-lg min-w-[200px]" data-checkout-details>
                                <div className="space-y-1">
                                  <div className="text-sm font-bold leading-none text-gray-800">{order.checkoutDetails.userDisplay}</div>
                                  {order.checkoutDetails.userEmail && (
                                      <div className="text-xs leading-none text-gray-600">{order.checkoutDetails.userEmail}</div>
                                  )}
                                  {order.checkoutDetails.userPhone && (
                                      <div className="text-xs leading-none text-gray-600">{order.checkoutDetails.userPhone}</div>
                                  )}
                                    <div className="text-xs leading-none text-gray-500">Since {order.checkoutDetails.checkedOutDate}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : order.isCheckedOut ? (
                          <div className="hover:bg-red-500 p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer">
                            <InfoIcon height={14} color="#6b7280" />
                          </div>
                        ) : (
                          <div 
                            className={`p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ${
                              checkoutStates[order.number.toString()] ? 'opacity-50' : 'hover:bg-green-500'
                            }`}
                            onClick={() => !checkoutStates[order.number.toString()] && handleCheckout(order.number.toString())}
                          >
                            <BookIcon height={14} color="#6b7280"></BookIcon>
                          </div>
                        )}
                        {isAdmin && (
                          <>
                            <div 
                              className="hover:bg-yellow-500 p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer ml-1"
                              onClick={() => handleEdit(order)}
                            >
                              <PencilIcon height={14} color="#6b7280"></PencilIcon>
                            </div>
                            <div 
                              className="hover:bg-red-500 p-1 border-[#6b7280] border rounded flex justify-center items-center transition duration-300 cursor-pointer"
                              onClick={() => handleDelete(order.id, order.title)}
                            >
                              <TrashIcon height={14} color="#6b7280"></TrashIcon>
                            </div>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Filter-style pagination menu */}
      {paginationInfo && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50/50">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center whitespace-nowrap rounded-sm m-0.5 px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm border">
              {currentStart}-{currentEnd} of {paginationInfo.total} • Page {paginationInfo.page}/{paginationInfo.totalPages}
            </div>
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
    </TooltipProvider>
  );
}
