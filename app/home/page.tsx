import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, Users, Heart, Lightbulb, Globe, GraduationCap, Baby, ChartBarStacked } from 'lucide-react';

export default function HomePage() {
  const categories = [
    {
      group: "Core Teachings",
      icon: <Heart className="h-5 w-5" />,
      description: "Essential teachings and biographies of the spiritual masters",
      items: [
        { code: "SRK", title: "Sri Ramakrishna, Life & Teachings", color: "bg-red-50 border-red-200 text-red-800" },
        { code: "HMS", title: "Holy Mother, Life and Teachings", color: "bg-pink-50 border-pink-200 text-pink-800" },
        { code: "VIV", title: "Swami Vivekananda, Life & Teachings", color: "bg-orange-50 border-orange-200 text-orange-800" },
      ]
    },
    {
      group: "Disciples & Devotees",
      icon: <Users className="h-5 w-5" />,
      description: "Lives and teachings of direct and other disciples",
      items: [
        { code: "DDL", title: "Lives of Direct Disciples of Sri Ramakrishna", color: "bg-blue-50 border-blue-200 text-blue-800" },
        { code: "ODL", title: "Lives of Other Disciples", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
      ]
    },
    {
      group: "Sacred Texts & Philosophy",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Ancient scriptures, philosophical works, and spiritual literature",
      items: [
        { code: "UVO", title: "Upanishads, Vedas, Sutras etc.", color: "bg-purple-50 border-purple-200 text-purple-800" },
        { code: "GIT", title: "Gita", color: "bg-violet-50 border-violet-200 text-violet-800" },
        { code: "VED", title: "Vedanta Philosophy", color: "bg-cyan-50 border-cyan-200 text-cyan-800" },
        { code: "SNK", title: "Sankara", color: "bg-teal-50 border-teal-200 text-teal-800" },
        { code: "OPH", title: "Other Philosophies", color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
      ]
    },
    {
      group: "Spiritual Practice",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Devotional practices, worship, and spiritual development",
      items: [
        { code: "SMH", title: "Songs, Mantra, Shlokas, Prayers & Hymns", color: "bg-amber-50 border-amber-200 text-amber-800" },
        { code: "DMW", title: "Divine mother worship", color: "bg-rose-50 border-rose-200 text-rose-800" },
        { code: "SPD", title: "Spiritual Practice & Discipline", color: "bg-lime-50 border-lime-200 text-lime-800" },
        { code: "SER", title: "Service to humanity", color: "bg-green-50 border-green-200 text-green-800" },
      ]
    },
    {
      group: "Knowledge & Culture",
      icon: <Globe className="h-5 w-5" />,
      description: "Mythology, history, science, and cultural heritage",
      items: [
        { code: "MNP", title: "Mythology & Puranas", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
        { code: "HIS", title: "History", color: "bg-stone-50 border-stone-200 text-stone-800" },
        { code: "SCI", title: "Science", color: "bg-sky-50 border-sky-200 text-sky-800" },
        { code: "SHR", title: "Subset of Hindu religion", color: "bg-orange-50 border-orange-200 text-orange-800" },
        { code: "PIL", title: "Pilgrimage & Tourism", color: "bg-teal-50 border-teal-200 text-teal-800" },
      ]
    },
    {
      group: "Education & Learning",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Educational materials and learning resources",
      items: [
        { code: "CLB", title: "Class books", color: "bg-slate-50 border-slate-200 text-slate-800" },
        { code: "KID", title: "Children", color: "bg-pink-50 border-pink-200 text-pink-800" },
      ]
    }
  ];

  const languages = [
    { code: "E", name: "English"},
    { code: "S", name: "Sanskrit"},
    { code: "H", name: "Hindi"},
    { code: "B", name: "Bengali" },
    { code: "T", name: "Tamil"},
  ];

  return (
    <div className="">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ramakrishna Vedanta Ashrama of Pittsburgh
            </h2>
            <h3 className="text-3xl font-bold text-gray-700 mb-4">
                Library Catalog
            </h3>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">2000</div>
              <div className="text-sm text-blue-600">Books Available</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">5</div>
              <div className="text-sm text-green-600">Languages</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <ChartBarStacked className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-800">21</div>
              <div className="text-sm text-purple-600">Categories</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-800">100+</div>
              <div className="text-sm text-orange-600">Authors</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Guide */}
        <div className="mb-12">
          <div className="space-y-8">
            {categories.map((group) => (
              <Card key={group.group} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {group.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{group.group}</CardTitle>
                      <CardDescription className="text-gray-600">{group.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.items.map((item) => (
                      <div 
                        key={item.code} 
                        className={`p-4 rounded-lg border-2 ${item.color} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">{item.code}</span>
                          <span className="text-sm font-medium">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Languages Section */}
        <Card className="mb-12">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
              <Globe className="h-5 w-5" />
              Available Languages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {languages.map((lang) => (
                <div 
                  key={lang.code}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:shadow-md transition-shadow text-center"
                >
                  <div className="font-bold text-gray-900">{lang.code}</div>
                  <div className="text-sm text-gray-600">{lang.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* How to Use Section */}
        <Card className="mb-12">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-3">
              <Search className="h-5 w-5" />
              How to Use the Catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Search & Filter</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Use category tabs to browse by subject area</li>
                  <li>• Filter by language using language tabs</li>
                  <li>• Search by title, author, or ID using the search bar</li>
                  <li>• Apply publication year filters for specific time periods</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Checking out and Returning Books</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Click the icon on the right side of the row to check out a book</li>
                  <li>• Click there again to return the book</li>
                  <li>• If a row is highlighted yellow it has already been checked out</li>
                  <li>• Hover over the right side of the row to view the check-out information</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Book Type Codes</h4>
                <ul className="space-y-2 text-gray-600">
                  <li><strong>A</strong> - Analysis: Analytical or commentary works</li>
                  <li><strong>C</strong> - Compiled: Compiled or collected works</li>
                  <li><strong>E</strong> - Edited: Edited or revised editions</li>
                  <li><strong>T</strong> - Translated: Translated works</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}