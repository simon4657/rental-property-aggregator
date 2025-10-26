import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Building2, ExternalLink, Filter, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const filters = useMemo(
    () => ({
      city: selectedCity || undefined,
      district: selectedDistrict || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      search: searchText || undefined,
    }),
    [selectedCity, selectedDistrict, minPrice, maxPrice, searchText]
  );

  const { data: properties, isLoading } = trpc.properties.list.useQuery(filters);
  const { data: cities } = trpc.properties.getCities.useQuery();
  const { data: districts } = trpc.properties.getDistricts.useQuery(
    { city: selectedCity || "" },
    { enabled: !!selectedCity }
  );

  const handleReset = () => {
    setSelectedCity(undefined);
    setSelectedDistrict(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSearchText("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">租賃物件資訊聚合平台</h1>
                <p className="text-sm text-slate-600">整合多個租賃網站，快速找到理想物件</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/scraper">
                <Button variant="outline">資料抓取</Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline">管理後台</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filter Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              篩選條件
            </CardTitle>
            <CardDescription>根據您的需求篩選租賃物件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City Select */}
              <div className="space-y-2">
                <Label htmlFor="city">縣市</Label>
                <Select value={selectedCity} onValueChange={(value) => {
                  setSelectedCity(value === "all" ? undefined : value);
                  setSelectedDistrict(undefined);
                }}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="選擇縣市" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {cities?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District Select */}
              <div className="space-y-2">
                <Label htmlFor="district">行政區</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={(value) => setSelectedDistrict(value === "all" ? undefined : value)}
                  disabled={!selectedCity}
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="選擇行政區" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {districts?.map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price */}
              <div className="space-y-2">
                <Label htmlFor="minPrice">最低租金</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="例如：10000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <Label htmlFor="maxPrice">最高租金</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="例如：30000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="search">關鍵字搜尋</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="搜尋地址、行政區或捷運站..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={handleReset}>
                  重置
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>搜尋結果</CardTitle>
            <CardDescription>
              {isLoading ? "載入中..." : `共找到 ${properties?.length || 0} 筆物件`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>地址</TableHead>
                      <TableHead>行政區</TableHead>
                      <TableHead>樓層</TableHead>
                      <TableHead>租金</TableHead>
                      <TableHead>房間數</TableHead>
                      <TableHead>屋齡</TableHead>
                      <TableHead>電梯</TableHead>
                      <TableHead>捷運</TableHead>
                      <TableHead>來源</TableHead>
                      <TableHead>連結</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.address}</TableCell>
                        <TableCell>{property.district}</TableCell>
                        <TableCell>{property.floor || "-"}</TableCell>
                        <TableCell className="text-blue-600 font-semibold">
                          ${property.price.toLocaleString()}
                        </TableCell>
                        <TableCell>{property.rooms || "-"}</TableCell>
                        <TableCell>{property.age ? `${property.age}年` : "-"}</TableCell>
                        <TableCell>{property.hasElevator ? "有" : "無"}</TableCell>
                        <TableCell>{property.nearMrt || "-"}</TableCell>
                        <TableCell>{property.source || "-"}</TableCell>
                        <TableCell>
                          <a
                            href={property.propertyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">目前沒有符合條件的物件</p>
                <p className="text-sm text-slate-500 mt-1">請調整篩選條件或稍後再試</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

