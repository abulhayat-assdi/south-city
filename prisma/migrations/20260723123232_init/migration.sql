-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PlotStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'BOOKED', 'SOLD');

-- CreateEnum
CREATE TYPE "PlotCategory" AS ENUM ('RESIDENTIAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'INSTALLMENT');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'BKASH', 'NAGAD', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NID', 'PHOTO', 'SIGNATURE', 'AGREEMENT', 'DEED', 'MONEY_RECEIPT', 'OTHER');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'CLOSED');

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nameEn" TEXT NOT NULL DEFAULT 'South Dhaka Properties & Housing Ltd.',
    "nameBn" TEXT,
    "taglinePrimary" TEXT DEFAULT 'Where Your Dream Finds Its Address',
    "taglineSecondary" TEXT DEFAULT 'Building Landmark, Creating Legacy',
    "aboutEn" TEXT,
    "aboutBn" TEXT,
    "visionEn" TEXT,
    "visionBn" TEXT,
    "missionEn" TEXT,
    "missionBn" TEXT,
    "coreValues" JSONB,
    "logoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "addressEn" TEXT,
    "addressBn" TEXT,
    "facebook" TEXT,
    "youtube" TEXT,
    "linkedin" TEXT,
    "whatsapp" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderMessage" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleBn" TEXT,
    "photoUrl" TEXT,
    "messageEn" TEXT,
    "messageBn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeaderMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleBn" TEXT,
    "bodyEn" TEXT,
    "bodyBn" TEXT,
    "coverUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameBn" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ONGOING',
    "tagline" TEXT,
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "locationEn" TEXT,
    "locationBn" TEXT,
    "sizeText" TEXT,
    "sectorsText" TEXT,
    "plotSizesText" TEXT,
    "roadWidthText" TEXT,
    "descriptionEn" TEXT,
    "descriptionBn" TEXT,
    "amenities" JSONB,
    "landmarks" JSONB,
    "distances" JSONB,
    "boundaries" JSONB,
    "plotTypes" JSONB,
    "trustItems" JSONB,
    "mapEmbedUrl" TEXT,
    "masterPlanUrl" TEXT,
    "brochureUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "captionEn" TEXT,
    "captionBn" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "customerCode" TEXT NOT NULL,
    "userId" TEXT,
    "fullNameEn" TEXT NOT NULL,
    "fullNameBn" TEXT,
    "fatherName" TEXT,
    "motherName" TEXT,
    "spouseName" TEXT,
    "nidNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "occupation" TEXT,
    "nationality" TEXT DEFAULT 'Bangladeshi',
    "phonePrimary" TEXT NOT NULL,
    "phoneSecondary" TEXT,
    "email" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "nomineeName" TEXT,
    "nomineeRelation" TEXT,
    "nomineeNid" TEXT,
    "nomineePhone" TEXT,
    "nomineeAddress" TEXT,
    "photoUrl" TEXT,
    "signatureUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "sizeKatha" DECIMAL(6,2) NOT NULL,
    "category" "PlotCategory" NOT NULL DEFAULT 'RESIDENTIAL',
    "roadWidthFt" INTEGER,
    "dimensions" TEXT,
    "faceDirection" TEXT,
    "status" "PlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "basePrice" DECIMAL(14,2),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "saleCode" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "salePrice" DECIMAL(14,2) NOT NULL,
    "downPayment" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "paymentType" "PaymentType" NOT NULL,
    "installmentCount" INTEGER,
    "installmentStartDate" TIMESTAMP(3),
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amountDue" DECIMAL(14,2) NOT NULL,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "installmentId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "referenceNo" TEXT,
    "note" TEXT,
    "isVoided" BOOLEAN NOT NULL DEFAULT false,
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedById" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "customerId" TEXT,
    "saleId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "projectSlug" TEXT,
    "preferredSize" TEXT,
    "source" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");

-- CreateIndex
CREATE INDEX "NewsPost_isPublished_publishedAt_idx" ON "NewsPost"("isPublished", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_isPublished_sortOrder_idx" ON "Project"("isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "ProjectImage_projectId_sortOrder_idx" ON "ProjectImage"("projectId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE INDEX "Customer_fullNameEn_idx" ON "Customer"("fullNameEn");

-- CreateIndex
CREATE INDEX "Customer_phonePrimary_idx" ON "Customer"("phonePrimary");

-- CreateIndex
CREATE INDEX "Plot_projectId_status_sizeKatha_sector_idx" ON "Plot"("projectId", "status", "sizeKatha", "sector");

-- CreateIndex
CREATE UNIQUE INDEX "Plot_projectId_sector_plotNumber_key" ON "Plot"("projectId", "sector", "plotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleCode_key" ON "Sale"("saleCode");

-- CreateIndex
CREATE INDEX "Sale_projectId_status_idx" ON "Sale"("projectId", "status");

-- CreateIndex
CREATE INDEX "Sale_customerId_status_idx" ON "Sale"("customerId", "status");

-- CreateIndex
CREATE INDEX "Installment_dueDate_status_idx" ON "Installment"("dueDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Installment_saleId_installmentNo_key" ON "Installment"("saleId", "installmentNo");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receiptNo_key" ON "Payment"("receiptNo");

-- CreateIndex
CREATE INDEX "Payment_saleId_paymentDate_idx" ON "Payment"("saleId", "paymentDate");

-- CreateIndex
CREATE INDEX "Document_customerId_idx" ON "Document"("customerId");

-- CreateIndex
CREATE INDEX "Document_saleId_idx" ON "Document"("saleId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Enquiry_status_createdAt_idx" ON "Enquiry"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Installment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
