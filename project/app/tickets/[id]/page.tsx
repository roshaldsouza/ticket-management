"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Ticket, 
  User, 
  Clock, 
  MessageSquare, 
  Send,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface TicketData {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo?: User;
  comments: Comment[];
  rating?: number;
}

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subject: '',
    description: '',
    status: '',
    priority: '',
    assignedTo: ''
  });
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/auth/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadTicket();
    loadUsers();
  }, [router, ticketId]);

  const loadTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTicket(data);
        setEditData({
          subject: data.subject,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo?.id || ''
        });
        setShowRating(data.status === 'resolved' && !data.rating && data.createdBy.id === user?.id);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.filter((u: User) => u.role === 'support' || u.role === 'admin'));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        loadTicket();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const updateTicket = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setIsEditing(false);
        loadTicket();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update ticket');
      }
    } catch (error) {
      setError('An error occurred while updating the ticket');
    }
  };

  const submitRating = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        setShowRating(false);
        loadTicket();
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: 'destructive',
      'in-progress': 'default',
      resolved: 'secondary',
      closed: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    } as const;

    return (
      <Badge className={colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const canEdit = user && (user.role === 'admin' || user.role === 'support' || 
    (user.role === 'user' && ticket?.createdBy.id === user.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-4">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Ticket #{ticket.id.slice(0, 8)}
                </h1>
                <p className="text-gray-600">
                  Created on {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {canEdit && !isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Ticket
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    {isEditing ? (
                      <Input
                        value={editData.subject}
                        onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                        className="text-xl font-semibold"
                      />
                    ) : (
                      <span>{ticket.subject}</span>
                    )}
                  </CardTitle>
                  <div className="flex space-x-2">
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={6}
                      />
                    </div>
                    
                    {(user?.role === 'admin' || user?.role === 'support') && (
                      <>
                        <div>
                          <Label>Status</Label>
                          <Select 
                            value={editData.status} 
                            onValueChange={(value) => setEditData({ ...editData, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Priority</Label>
                          <Select 
                            value={editData.priority} 
                            onValueChange={(value) => setEditData({ ...editData, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Assign To</Label>
                          <Select 
                            value={editData.assignedTo} 
                            onValueChange={(value) => setEditData({ ...editData, assignedTo: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button onClick={updateTicket}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    {ticket.rating && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 mr-2">Customer Rating:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < ticket.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">({ticket.rating}/5)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating */}
            {showRating && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Resolution</CardTitle>
                  <CardDescription>
                    How satisfied are you with the resolution of this ticket?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Button onClick={submitRating} disabled={rating === 0}>
                      Submit Rating
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({ticket.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {ticket.comments.map((comment, index) => (
                  <div key={comment.id}>
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{comment.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {comment.user.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                    {index < ticket.comments.length - 1 && <Separator className="my-6" />}
                  </div>
                ))}

                {ticket.comments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No comments yet. Be the first to add a comment!
                  </p>
                )}

                <Separator />

                <div className="space-y-4">
                  <Label>Add a comment</Label>
                  <Textarea
                    placeholder="Type your comment here..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Add Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Priority</Label>
                  <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created By</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>{ticket.createdBy.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {ticket.createdBy.role}
                    </Badge>
                  </div>
                </div>
                
                {ticket.assignedTo && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Assigned To</Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{ticket.assignedTo.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {ticket.assignedTo.role}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{new Date(ticket.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}