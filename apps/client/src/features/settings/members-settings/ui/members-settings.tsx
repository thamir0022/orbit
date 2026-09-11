// 'use client'

// import { Button } from '@/shared/ui/button'
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/shared/ui/dialog'
// import { Controller, useForm } from 'react-hook-form'
// import { LuUserRoundPlus } from 'react-icons/lu'
// // import {
// //   InviteMemberData,
// //   InviteMemberSchema,
// // } from '../model/invite-member.schema'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/ui/field'
// import { Input } from '@/shared/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from '@/shared/ui/select'

// export const MembersSettings = () => {
//   const form = useForm<InviteMemberData>({
//     resolver: zodResolver(InviteMemberSchema),
//     defaultValues: {
//       email: '',
//       role: '',
//     },
//   })

//   const onSubmit = (data: InviteMemberData) => {
//     console.log(data)
//   }

//   const items = [
//     {
//       label: 'Designer',
//       value: '019f5503-4846-7335-b9ec-671038c97bd6',
//     },
//     {
//       label: 'Developer',
//       value: '019f5503-7513-72f4-ab0c-959c541f5934',
//     },
//   ]
//   return (
//     <div className="mx-auto w-full max-w-2xl">
//       <div className="space-y-1">
//         <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

//         <p className="text-muted-foreground text-sm">
//           Manage your personal information.
//         </p>
//       </div>

//       <Dialog>
//         <form
//           className=""
//           id="invite-member-form"
//           onSubmit={form.handleSubmit(onSubmit)}
//         >
//           <DialogTrigger asChild>
//             <Button>
//               <LuUserRoundPlus />
//               Invite
//             </Button>
//           </DialogTrigger>

//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle className="text-center">
//                 Invite New Member
//               </DialogTitle>
//             </DialogHeader>

//             <FieldGroup>
//               <Controller
//                 name="email"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field data-invalid={fieldState.invalid}>
//                     <FieldLabel htmlFor="email">Email</FieldLabel>
//                     <Input
//                       {...field}
//                       id="email"
//                       aria-invalid={fieldState.invalid}
//                       placeholder="Enter the invitee email"
//                       autoComplete="off"
//                     />
//                     {fieldState.invalid && (
//                       <FieldError errors={[fieldState.error]} />
//                     )}
//                   </Field>
//                 )}
//               />

//               <Controller
//                 name="role"
//                 control={form.control}
//                 render={({ field, fieldState }) => (
//                   <Field data-invalid={fieldState.invalid}>
//                     <FieldLabel htmlFor="role">Role</FieldLabel>
//                     <Select onValueChange={field.onChange}>
//                       <SelectTrigger
//                         className="w-full max-w-48"
//                         aria-invalid={fieldState.invalid}
//                       >
//                         <SelectValue placeholder="Select a role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectGroup>
//                           <SelectLabel>Roles</SelectLabel>
//                           {items.map((item) => (
//                             <SelectItem
//                               className="cursor-pointer"
//                               key={item.value}
//                               value={item.value}
//                             >
//                               {item.label}
//                             </SelectItem>
//                           ))}
//                         </SelectGroup>
//                       </SelectContent>
//                     </Select>

//                     {fieldState.invalid && (
//                       <FieldError errors={[fieldState.error]} />
//                     )}
//                   </Field>
//                 )}
//               />
//             </FieldGroup>

//             <DialogFooter>
//               <DialogClose asChild>
//                 <Button variant="outline">Cancel</Button>
//               </DialogClose>
//               <Button type="submit" form="invite-member-form">
//                 Save changes
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </form>
//       </Dialog>
//     </div>
//   )
// }
