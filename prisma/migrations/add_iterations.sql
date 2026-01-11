-- Create Iteration table
CREATE TABLE "Iteration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Iteration_pkey" PRIMARY KEY ("id")
);

-- Create index
CREATE INDEX "Iteration_isActive_idx" ON "Iteration"("isActive");

-- Insert default first iteration
INSERT INTO "Iteration" ("id", "name", "description", "isActive")
VALUES ('iteration_1', 'Iteration 1', 'First iteration of the Offsets project', true);

-- Add iterationId column to Node table with default
ALTER TABLE "Node" ADD COLUMN "iterationId" TEXT DEFAULT 'iteration_1';

-- Update all existing nodes to belong to iteration 1
UPDATE "Node" SET "iterationId" = 'iteration_1' WHERE "iterationId" IS NULL;

-- Make iterationId required
ALTER TABLE "Node" ALTER COLUMN "iterationId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Node" ADD CONSTRAINT "Node_iterationId_fkey" FOREIGN KEY ("iterationId") REFERENCES "Iteration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add index
CREATE INDEX "Node_iterationId_idx" ON "Node"("iterationId");
