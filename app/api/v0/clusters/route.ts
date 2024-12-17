import { withAuth } from "@/lib/auth"
import { createClusterSchema } from "@/lib/zod/schemas/cluster"

export const GET = withAuth(async ({ prisma, user }) => {
  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  const clusters = await prisma.cluster.findMany({
    where: {
      teamId: user.id,
    },
    include: {
      configurations: {
        include: {
          instanceType: true,
        }
      }
    },
  })

  clusters[0].configurations[0].instanceType.hourlyPrice

  return Response.json(clusters)
})

export const POST = withAuth(async ({ request, prisma, user }) => {
  const requestBody = await request.json()

  if (!user) {
    return new Response("Invalid API key", {
      status: 401,
    })
  }

  // validate payload schema
  let clusterPayload
  try {
    clusterPayload = createClusterSchema.parse(requestBody)
  } catch (error) {
    console.error("cluster payload invalid", error)
    return new Response("Invalid payload", {
      status: 400,
    })
  }

  const {
    nickname,
    description,
    hardware,
    configuration,
    cycle_type,
    proof_type,
  } = clusterPayload

  // get & validate instance type ids
  const instanceTypes = await prisma.awsInstancePricing.findMany({
    where: {
      instanceType: {
        in: configuration.map((config) => config.instance_type),
      },
    },
    select: {
      id: true,
      instanceType: true,
    },
  })

  if (instanceTypes.length !== configuration.length) {
    return new Response("Invalid cluster configuration", { status: 400 })
  }

  // create cluster
  const cluster = await prisma.cluster.create({
    data: {
      nickname,
      description,
      hardware,
      cycleType: cycle_type,
      proofType: proof_type,
      teamId: user.id,
      configurations: {
        create: configuration.map(({ instance_type, instance_count }) => ({
          instanceType: {
            connect: {
              id: instanceTypes.find(
                (instanceType) => instanceType.instanceType === instance_type
              )!.id,
            },
          },
          instanceCount: instance_count,
        })),
      },
    },
    select: {
      id: true,
      index: true,
    },
  })

  return Response.json({ id: cluster.index })
})
