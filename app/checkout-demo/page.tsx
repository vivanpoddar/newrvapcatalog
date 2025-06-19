import { createClient } from '@/utils/supabase/server';
import Catalog from '@/components/catalog/catalog';

// Mock data to demonstrate checkout details display
const mockCatalogData = [
  {
    number: 1,
    title: "Sample Book 1",
    category: "GIT",
    language: ["E"],
    titlecount: 1,
    categorycount: 1,
    categoryindex: 1,
    id: "1 GIT-E 1.1",
    pubyear: 2020,
    firstname: "John",
    lastname: "Doe",
    rev: "",
    editedtranslated: null,
    isCheckedOut: true,
    checkedOutByCurrentUser: false,
    checkoutDetails: {
      user_id: "12345678-1234-1234-1234-123456789012",
      checked_out_at: "2025-06-15T10:30:00Z",
      userDisplay: "John Doe",
      userEmail: "john.doe@example.com",
      userPhone: "+1-555-123-4567",
      checkedOutDate: "6/15/2025"
    }
  },
  {
    number: 2,
    title: "Sample Book 2",
    category: "DDL",
    language: ["S"],
    titlecount: 1,
    categorycount: 2,
    categoryindex: 2,
    id: "2 DDL-S 2.1",
    pubyear: 2021,
    firstname: "Jane",
    lastname: "Smith",
    rev: "",
    editedtranslated: null,
    isCheckedOut: true,
    checkedOutByCurrentUser: true,
    checkoutDetails: {
      user_id: "current-user-id-here",
      checked_out_at: "2025-06-18T14:15:00Z",
      userDisplay: "Jane Smith",
      userEmail: "jane.smith@example.com", 
      userPhone: "+1-555-987-6543",
      checkedOutDate: "6/18/2025"
    }
  },
  {
    number: 3,
    title: "Sample Book 3",
    category: "SPD",
    language: ["H"],
    titlecount: 1,
    categorycount: 3,
    categoryindex: 3,
    id: "3 SPD-H 3.1",
    pubyear: 2022,
    firstname: "Bob",
    lastname: "Johnson",
    rev: "",
    editedtranslated: null,
    isCheckedOut: false,
    checkedOutByCurrentUser: false,
    checkoutDetails: null
  }
];

export default async function CheckoutDemoPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Checkout System Demo</h1>
        <p className="text-gray-600 mb-4">
          This demonstrates how checkout details are displayed to users:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Checkout Status Legend:</h3>
          <ul className="space-y-1 text-sm">
            <li><strong>Book 1:</strong> Checked out by another user (hover "Checked Out" to see tooltip with name, email, phone)</li>
            <li><strong>Book 2:</strong> Checked out by current user (shows return button)</li>
            <li><strong>Book 3:</strong> Available for checkout (shows checkout button)</li>
          </ul>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Catalog data={mockCatalogData} isAdmin={false} />
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-semibold mb-2">Features Implemented:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ Users can see who has checked out each book (name, email, phone in tooltip)</li>
          <li>✅ Users can see when books were checked out</li>
          <li>✅ Rich tooltips show full user contact information</li>
          <li>✅ Current user can return their own books</li>
          <li>✅ Available books show checkout button</li>
          <li>✅ Checkout details are fetched from database with user profiles</li>
        </ul>
      </div>
    </div>
  );
}
