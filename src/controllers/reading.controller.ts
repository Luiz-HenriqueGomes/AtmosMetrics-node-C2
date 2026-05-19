import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createReading = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { temperature, humidity, airQuality, stationId } = req.body;
    const userId = req.userId!;

    const station = await prisma.station.findUnique({ where: { id: stationId } });

    if (!station) {
      res.status(404).json({ message: 'Station not found' });
      return;
    }

    if (station.userId !== userId) {
      res.status(403).json({ message: 'Forbidden: You do not own this station' });
      return;
    }

    const reading = await prisma.reading.create({
      data: {
        temperature,
        humidity,
        airQuality,
        stationId,
      },
    });

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReadingsByStation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { stationId } = req.params;
    const userId = req.userId!;

    const station = await prisma.station.findUnique({ where: { id: stationId } });

    if (!station) {
      res.status(404).json({ message: 'Station not found' });
      return;
    }

    if (station.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const readings = await prisma.reading.findMany({
      where: { stationId },
      orderBy: { timestamp: 'desc' },
    });

    res.status(200).json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReadingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const reading = await prisma.reading.findUnique({
      where: { id },
      include: { station: true },
    });

    if (!reading) {
      res.status(404).json({ message: 'Reading not found' });
      return;
    }

    if (reading.station.userId !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.status(200).json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
