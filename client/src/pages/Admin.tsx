import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: properties, isLoading } = trpc.properties.list.useQuery();

  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      setIsCreateDialogOpen(false);
      toast.success("物件新增成功");
    },
    onError: (error) => {
      toast.error(`新增失敗：${error.message}`);
    },
  });

  const updateMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      setEditingProperty(null);
      toast.success("物件更新成功");
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      toast.success("物件刪除成功");
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      propertyUrl: formData.get("propertyUrl") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      floor: formData.get("floor") as string || undefined,
      price: parseInt(formData.get("price") as string),
      rooms: formData.get("rooms") as string || undefined,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : undefined,
      hasElevator: formData.get("hasElevator") === "on",
      nearMrt: formData.get("nearMrt") as string || undefined,
      source: formData.get("source") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProperty) return;

    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: editingProperty,
      propertyUrl: formData.get("propertyUrl") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      district: formData.get("district") as string,
      floor: formData.get("floor") as string || undefined,
      price: parseInt(formData.get("price") as string),
      rooms: formData.get("rooms") as string || undefined,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : undefined,
      hasElevator: formData.get("hasElevator") === "on",
      nearMrt: formData.get("nearMrt") as string || undefined,
      source: formData.get("source") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("確定要刪除此物件嗎？")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登入</CardTitle>
            <CardDescription>請先登入以使用管理功能</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const editProperty = properties?.find(p => p.id === editingProperty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">管理後台</h1>
                <p className="text-sm text-slate-600">管理租賃物件資訊</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">歡迎，{user.name}</span>
              <Link href="/">
                <Button variant="outline">返回首頁</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>物件列表</CardTitle>
                <CardDescription>
                  {isLoading ? "載入中..." : `共 ${properties?.length || 0} 筆物件`}
                </CardDescription>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新增物件
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>新增物件</DialogTitle>
                    <DialogDescription>填寫物件資訊以新增至資料庫</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreate}>
                    <PropertyForm />
                    <DialogFooter className="mt-4">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        取消
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "新增中..." : "新增"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
                      <TableHead>租金</TableHead>
                      <TableHead>房間數</TableHead>
                      <TableHead>來源</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.address}</TableCell>
                        <TableCell>{property.district}</TableCell>
                        <TableCell className="text-blue-600 font-semibold">
                          ${property.price.toLocaleString()}
                        </TableCell>
                        <TableCell>{property.rooms || "-"}</TableCell>
                        <TableCell>{property.source || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingProperty(property.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(property.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">尚未新增任何物件</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>編輯物件</DialogTitle>
            <DialogDescription>修改物件資訊</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <PropertyForm defaultValues={editProperty} />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProperty(null)}>
                取消
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "更新中..." : "更新"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PropertyForm({ defaultValues }: { defaultValues?: any }) {
  const taiwanCities = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "嘉義市", "新竹縣", "苗栗縣", "彰化縣",
    "南投縣", "雲林縣", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "台東縣", "澎湖縣", "金門縣", "連江縣"
  ];

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="propertyUrl">物件網址 *</Label>
        <Input
          id="propertyUrl"
          name="propertyUrl"
          type="url"
          required
          defaultValue={defaultValues?.propertyUrl}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">縣市 *</Label>
          <Select name="city" defaultValue={defaultValues?.city} required>
            <SelectTrigger id="city">
              <SelectValue placeholder="選擇縣市" />
            </SelectTrigger>
            <SelectContent>
              {taiwanCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="district">行政區 *</Label>
          <Input
            id="district"
            name="district"
            required
            defaultValue={defaultValues?.district}
            placeholder="例如：中正區"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">地址 *</Label>
        <Input
          id="address"
          name="address"
          required
          defaultValue={defaultValues?.address}
          placeholder="完整地址"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">租金 (元/月) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            defaultValue={defaultValues?.price}
            placeholder="20000"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="floor">樓層</Label>
          <Input
            id="floor"
            name="floor"
            defaultValue={defaultValues?.floor}
            placeholder="3/5"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="age">屋齡 (年)</Label>
          <Input
            id="age"
            name="age"
            type="number"
            defaultValue={defaultValues?.age}
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="rooms">房間數</Label>
          <Input
            id="rooms"
            name="rooms"
            defaultValue={defaultValues?.rooms}
            placeholder="3房2廳1衛"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="source">來源</Label>
          <Input
            id="source"
            name="source"
            defaultValue={defaultValues?.source}
            placeholder="591, 信義房屋..."
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nearMrt">靠近捷運</Label>
        <Input
          id="nearMrt"
          name="nearMrt"
          defaultValue={defaultValues?.nearMrt}
          placeholder="捷運站名或線路"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasElevator"
          name="hasElevator"
          defaultChecked={defaultValues?.hasElevator}
        />
        <Label htmlFor="hasElevator" className="cursor-pointer">有電梯</Label>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">備註</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={defaultValues?.notes}
          placeholder="其他備註資訊..."
          rows={3}
        />
      </div>
    </div>
  );
}

