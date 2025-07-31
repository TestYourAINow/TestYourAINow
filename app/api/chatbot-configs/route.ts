import { connectToDatabase } from '@/lib/db';
import { ChatbotConfig } from '@/models/ChatbotConfig';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { updateAgentDeploymentStatus } from '@/lib/deployment-utils'; // 🆕 IMPORT

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const config = await request.json();
    
    // Créer la nouvelle configuration
    const newConfig = new ChatbotConfig({
      ...config,
      userId: session.user.id, // 🔒 Associer à l'utilisateur connecté
      deployedAt: new Date()
    });
    
    const savedConfig = await newConfig.save();

    // 🆕 NOUVEAU - Mettre isDeployed = true sur l'agent choisi (Website Widget)
    if (config.selectedAgent) {
      await updateAgentDeploymentStatus(config.selectedAgent, true);
      console.log(`🎉 [DEPLOYMENT] Agent ${config.selectedAgent} marked as deployed! (Website Widget)`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration sauvegardée avec succès',
      widgetId: savedConfig._id.toString() // ⭐ Retourner l'ID
    });
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les configs de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const configs = await ChatbotConfig.find({ 
      userId: session.user.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, configs });
    
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une config
export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { widgetId, ...updateData } = await request.json();
    
    const updatedConfig = await ChatbotConfig.findOneAndUpdate(
      { 
        _id: widgetId,
        userId: session.user.id // 🔒 Sécurité: Vérifier que c'est bien son widget
      },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedConfig) {
      return NextResponse.json(
        { success: false, error: 'Widget non trouvé' },
        { status: 404 }
      );
    }

    // 🆕 NOUVEAU - Mettre à jour isDeployed si l'agent change
    if (updateData.selectedAgent) {
      await updateAgentDeploymentStatus(updateData.selectedAgent, true);
      console.log(`🎉 [DEPLOYMENT] Agent ${updateData.selectedAgent} marked as deployed! (Website Widget Update)`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      widgetId: updatedConfig._id.toString()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}